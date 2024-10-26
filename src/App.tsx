import { useCallback, useEffect, useRef } from "react";
import "./App.css";
import {
    C64emu,
    C64emuBase,
    TickInfo,
} from "../types/floooh_chips-test_webapi";
import { fetchBinaryData, fetchPrgForLoad, sleep } from "./utils";

declare global {
    function initDebugC64(c64emu: C64emu): void;
    function initC64(c64emu: C64emu): void;
}

const makeHeatmap = (heatmapCanvas: HTMLCanvasElement) => {
    const ctx = heatmapCanvas.getContext("2d")!;

    const width1 = 256;
    const height1 = Math.floor((65536 + width1 - 1) / width1);

    const width = width1 * 2;
    const height = height1 * 2;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Set alpha
    // for (let i = data.length - 1; i > 0; i -= 4) data[i] = 255;

    const VALUE = 128;

    const lineOfs0 = width * 4;
    const lineOfs1 = width * 4 + 4;
    const rowOfs = width * 8;

    const setPixel = (index: number, alphaIndex: number) => {
        data[index] = VALUE;
        data[index + 4] = VALUE;
        data[index + lineOfs0] = VALUE;
        data[index + lineOfs1] = VALUE;
        data[alphaIndex] = 255;
        data[alphaIndex + 4] = 255;
        data[alphaIndex + lineOfs0] = 255;
        data[alphaIndex + lineOfs1] = 255;
    };

    const markPixel = (index: number) => {
        data[index + 4] = data[index + lineOfs0] = data[index + lineOfs1] = 255;
    };

    const unmarkPixel = (index: number) => {
        data[index + 4] =
            data[index + lineOfs0] =
            data[index + lineOfs1] =
                data[index];
    };

    const M6502_PIN_RW = 24 - 16; // out: memory read or write access
    const M6502_PIN_SYNC = 25 - 16; // out: start of a new instruction
    const M6502_RW = 1 << M6502_PIN_RW;
    const M6502_SYNC = 1 << M6502_PIN_SYNC;

    let last_op_index = 0;

    const record = ({ pins_flags, pins_addr }: TickInfo) => {
        const new_op = pins_flags & M6502_SYNC;
        let index: number;
        if (width1 === 256) {
            index = (pins_addr >> 8) * rowOfs + (pins_addr & 255) * 8;
        } else {
            index =
                Math.floor(pins_addr / width) * rowOfs +
                (pins_addr % width) * 8;
        }
        const rw = pins_flags & M6502_RW ? 2 : 1;
        if (new_op) {
            unmarkPixel(last_op_index + 1);
            unmarkPixel(last_op_index + 2);
            setPixel(index, index + 3);
            last_op_index = index;
            markPixel(last_op_index + 1);
            markPixel(last_op_index + 2);
        }
        if (index === last_op_index) {
            data[index + rw] = VALUE;
            data[index + 3] = 255;
        } else {
            setPixel(index + rw, index + 3);
        }
    };

    const update = () => {
        ctx.putImageData(imageData, 0, 0);
        for (let i = data.length - 1; i > 0; i -= 4)
            if (data[i] >= 0) --data[i];
        requestAnimationFrame(update);
    };

    update();

    return { record };
};

let tick1 = 0; // TODO fetch from emulator

const useC64emu = () => {
    const makeC64emu = useCallback(
        (
            c64emuCanvas: HTMLCanvasElement,
            heatmapCanvas: HTMLCanvasElement
        ): C64emu => {
            c64emuCanvas.addEventListener(
                "webglcontextlost",
                function (event) {
                    alert("FIXME: WebGL context lost, please reload the page");
                    event.preventDefault();
                },
                false
            );

            const heatmap = makeHeatmap(heatmapCanvas);

            const c64emu: C64emuBase = {
                preRun: [],
                postRun: [],

                print: function (...args) {
                    const str = Array.prototype.slice.call(args).join(" ");
                    console.log("c64Emu.print", str);
                },

                printErr: function (...args) {
                    const str = Array.prototype.slice.call(args).join(" ");
                    console.error("c64Emu.printErr", str);
                },

                canvas: c64emuCanvas,

                setStatus: function (args) {
                    console.log("c64emu.setStatus", args);
                },

                monitorRunDependencies: function (args) {
                    console.log("c64emu.monitorRunDependencies", args);
                },

                webapi_onStopped: function (reason, addr) {
                    console.log("c64emu.onStopped:", reason, addr);
                },

                webapi_onContinued: function () {
                    console.log("c64emu.onContinued");
                },

                webapi_onTick: function (tick_info) {
                    if (tick1++ % 1000000 === 0) {
                        console.log("c64emu.onTick", tick_info);
                    }
                    heatmap.record(tick_info);
                },
            };

            return c64emu as C64emu;
        },
        []
    );

    return { makeC64emu };
};

function App() {
    const c64emuCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const c64emuRef = useRef<C64emu>();
    const { makeC64emu } = useC64emu();

    const getC64emu = async (): Promise<C64emu> => {
        if (!c64emuRef.current) throw new Error("c64emuRef not ready");
        return c64emuRef.current;
    };

    const loadMULE2 = useCallback(async () => {
        await sleep(3);
        const c64emu = await getC64emu();
        const prg = await fetchPrgForLoad("/MULE.2.prg", 0x4000);
        const size = prg.length;
        const ptr = c64emu._webapi_alloc(size);
        c64emu.HEAPU8.set(prg, ptr);
        if (!c64emu._webapi_load(ptr, size)) {
            console.warn("_webapi_load() returned false");
        }
        c64emu._webapi_free(ptr);
        await sleep(1);
        c64emu._webapi_dbg_continue(); // doesn't work?
    }, []);

    const loadVicePrg = useCallback(async () => {
        const c64emu = await getC64emu();
        c64emu._webapi_dbg_break();

        await sleep(1); // Warum auch immer...

        const prg = await fetchBinaryData(
            "/vice-snapshot-05-round-1-finished.prg"
        );
        const size = prg.length;
        const ptr = c64emu._webapi_alloc(size - 2);
        c64emu.HEAPU8.set(prg.slice(2), ptr);
        if (
            !c64emu._webapi_dbg_write_memory(prg[0] + (prg[1] << 8), size, ptr)
        ) {
            console.warn("_webapi_dbg_write_memory() returned false");
        }
        c64emu._webapi_free(ptr);
        c64emu._webapi_reset();
    }, []);

    useEffect(() => {
        if (
            !c64emuRef.current &&
            c64emuCanvasRef.current &&
            heatmapCanvasRef.current
        ) {
            const c64emu = makeC64emu(
                c64emuCanvasRef.current,
                heatmapCanvasRef.current
            );
            globalThis.initDebugC64(c64emu);
            // globalThis.initC64(c64emu);
            c64emuRef.current = c64emu;
            console.log("c64emu=", c64emu);

            loadMULE2();
        }
    }, [loadMULE2, makeC64emu]);

    const onStopClick = () => {
        c64emuRef.current?._webapi_dbg_break();
    };

    const onContClick = () => {
        c64emuRef.current?._webapi_dbg_continue();
    };

    const onStepClick = () => {
        c64emuRef.current?._webapi_dbg_step_into();
    };

    const onLoadVicePrg = () => {
        loadVicePrg();
    };

    const onResetClick = () => {
        // Currently this sets the PC to $4000 and does not do a reset
        c64emuRef.current?._webapi_reset();
    };

    return (
        <div className="App">
            <div style={{ flex: 1 }}>
                <canvas
                    style={{ height: 400 }}
                    ref={c64emuCanvasRef}
                    id="canvas"
                    onContextMenu={(event) => event.preventDefault()}
                ></canvas>
            </div>
            <div>
                <button onClick={onStopClick}>Stop</button>
                <button onClick={onContClick}>Cont</button>
                <button onClick={onStepClick}>Step</button>
                <button onClick={onLoadVicePrg}>LoadVicePrg</button>
                <button onClick={onResetClick}>Reset</button>
            </div>
            <div>
                <canvas
                    ref={heatmapCanvasRef}
                    width={512}
                    height={512}
                ></canvas>
            </div>
        </div>
    );
}

export default App;

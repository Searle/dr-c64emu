import { useCallback, useEffect, useRef } from "react";
import "./App.css";
import {
    C64emu,
    C64emuBase,
    TickInfo,
} from "../types/floooh_chips-test_webapi";
import { fetchPrgForLoad } from "./utils";

declare global {
    function initDebugC64(c64emu: C64emu): void;
    function initC64(c64emu: C64emu): void;
}

const makeHeatmap = (heatmapCanvas: HTMLCanvasElement) => {
    const ctx = heatmapCanvas.getContext("2d")!;
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;

    // Set alpha
    for (let i = data.length - 1; i > 0; i -= 4) data[i] = 255;

    const VALUE = 128;

    const setPixel = (index: number) => {
        data[index] = VALUE;
        data[index + 4] = VALUE;
        data[index + 2048] = VALUE;
        data[index + 2052] = VALUE;
    };

    const markPixel = (index: number) => {
        data[index + 4] = data[index + 2048] = data[index + 2052] = 255;
    };

    const unmarkPixel = (index: number) => {
        data[index + 4] = data[index + 2048] = data[index + 2052] = data[index];
    };

    const M6502_PIN_RW = 24 - 16; // out: memory read or write access
    const M6502_PIN_SYNC = 25 - 16; // out: start of a new instruction
    const M6502_RW = 1 << M6502_PIN_RW;
    const M6502_SYNC = 1 << M6502_PIN_SYNC;

    let last_op_index = 0;

    const record = ({ pins_flags, pins_addr }: TickInfo) => {
        const new_op = pins_flags & M6502_SYNC;
        const index = (pins_addr >> 8) * 4096 + (pins_addr & 255) * 8;
        const rw = pins_flags & M6502_RW ? 1 : 2;
        if (new_op) {
            unmarkPixel(last_op_index + 1);
            unmarkPixel(last_op_index + 2);
            setPixel(index);
            last_op_index = index;
            markPixel(last_op_index + 1);
            markPixel(last_op_index + 2);
        }
        if (index === last_op_index) {
            data[index + rw] = VALUE;
        } else {
            setPixel(index + rw);
        }
    };

    const update = () => {
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(update);
    };

    update();

    return { record };
};

const xx = async () => {
    const code = await fetchPrgForLoad("/MULE.2.prg");
    console.log("CODE", code);
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

            xx();

            const heatmap = makeHeatmap(heatmapCanvas);

            const c64Emu: C64emuBase = {
                preRun: [],
                postRun: [],

                print: function (...args) {
                    const str = Array.prototype.slice.call(args).join(" ");
                    console.log(str);
                },

                printErr: function (...args) {
                    const str = Array.prototype.slice.call(args).join(" ");
                    console.error(str);
                },

                canvas: c64emuCanvas,

                setStatus: function (args) {
                    console.log("setStatus", args);
                },

                monitorRunDependencies: function (args) {
                    console.log("monitorRunDependencies", args);
                },

                webapi_onStopped: function (reason, addr) {
                    console.log("ONSTOPPED:", reason, addr);
                },

                webapi_onContinued: function () {
                    console.log("CONTINUED");
                },

                webapi_onTick: function (tick_info) {
                    if (tick1++ % 1000000 === 0) {
                        console.log("TICK", tick_info);
                    }
                    heatmap.record(tick_info);
                },
            };

            return c64Emu as C64emu;
        },
        []
    );

    return { makeC64emu };
};

function App() {
    const c64emuCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const c64emuRef = useRef<C64emu>();
    const runOnce = useRef(false);
    const { makeC64emu } = useC64emu();

    useEffect(() => {
        if (
            !runOnce.current &&
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
            runOnce.current = true;
        }
    }, [makeC64emu]);

    const onStopClick = () => {
        c64emuRef.current?._webapi_dbg_break();
    };

    const onStepClick = () => {
        c64emuRef.current?._webapi_dbg_step_into();
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
                <button onClick={onStepClick}>Step</button>
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

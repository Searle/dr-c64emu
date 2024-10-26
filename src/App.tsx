import { useCallback, useEffect, useRef } from "react";
import "./App.css";
import { C64emu, C64emuBase } from "../types/floooh_chips-test_webapi";
import { fetchBinaryData, fetchPrgForLoad, sleep } from "./utils";
import { makeHeatmap } from "./makeHeatmap";

declare global {
    function initDebugC64(c64emu: C64emu): void;
    function initC64(c64emu: C64emu): void;
}

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

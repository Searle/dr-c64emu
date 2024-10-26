declare interface C64shell {
    preRun: unknown[]; // TODO unknown
    postRun: unknown[]; // TODO unknown

    print: (...args: unknown[]) => void; // TODO: unknown
    printErr: (...args: unknown[]) => void; // TODO: unknown
    canvas: HTMLCanvasElement;
    setStatus?: (message: string) => void;
    monitorRunDependencies: (args: unknown) => void; // TODO: unknown

    // requestFullScreen ?
}

declare interface _webapiDasmLine {
    addr: number;
    bytes: Uint8Array;
    disassembly: string;
}

export declare interface TickInfo {
    pins_flags: number;
    pins_addr: number;
}

export declare interface C64emuEvents {
    webapi_onStopped?: (stopReason: number, addr: number) => void;
    webapi_onContinued?: () => void;
    webapi_onReboot?: () => void;
    webapi_onReset?: () => void;
    webapi_onTick?: (tick_info: TickInfo) => void;
}

export declare interface C64emuApi {
    // _webapi_input: (text: string) => void;

    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array;
    HEAP32: Int32Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    HEAPF64: Float64Array;

    // _webapi functions
    _webapi_dbg_connect: () => void;
    _webapi_dbg_disconnect: () => void;
    _webapi_alloc: (size: number) => number;
    _webapi_free: (ptr: number) => void;
    _webapi_boot: () => void;
    _webapi_reset: () => void;
    _webapi_ready: () => boolean;
    _webapi_load: (ptr: number, size: number) => boolean;
    _webapi_load_snapshot: (index: number) => boolean;
    _webapi_save_snapshot: (index: number) => void;
    _webapi_dbg_add_breakpoint: (addr: number) => void;
    _webapi_dbg_remove_breakpoint: (addr: number) => void;
    _webapi_dbg_break: () => void;
    _webapi_dbg_continue: () => void;
    _webapi_dbg_step_next: () => void;
    _webapi_dbg_step_into: () => void;
    _webapi_dbg_set_pc: (pc: number) => void;
    _webapi_dbg_cpu_state: () => Uint16Array;
    _webapi_dbg_request_disassembly: (
        addr: number,
        offsetLines: number,
        numLines: number
    ) => _webapiDasmLine[] | null;
    _webapi_dbg_read_memory: (
        addr: number,
        numBytes: number
    ) => Uint8Array | null;
    _webapi_dbg_write_memory: (
        addr: number,
        numBytes: number,
        src: number
    ) => bool;
    _webapi_input: (text: string) => boolean;
}

export declare type C64emuBase = C64shell & C64emuEvents;
export declare type C64emu = C64emuBase & C64emuApi;

export {};

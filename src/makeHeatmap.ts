import { TickInfo } from "../types/floooh_chips-test_webapi";

export const makeHeatmap = (heatmapCanvas: HTMLCanvasElement) => {
    const ctx = heatmapCanvas.getContext("2d")!;

    const width1 = 256;
    const height1 = Math.floor((65536 + width1 - 1) / width1);

    const width = width1 * 2;
    const height = height1 * 2;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

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

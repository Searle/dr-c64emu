export const sleep = (sec: number) =>
    new Promise((resolve) => setTimeout(resolve, sec * 1000));

const fetchBinaryData = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

/*
    // @see github://floooh/chips-test/examples/common/webapi.h

    typedef struct {
        uint8_t magic[4];       // 'CHIP'
        uint8_t type[4];        // 'KCC ', 'PRG ', etc...
        uint8_t start_addr_lo;  // execution starts here
        uint8_t start_addr_hi;
        uint8_t flags;
        uint8_t reserved[5];
        uint8_t payload[];
    } webapi_fileheader_t;
 */
export const fetchPrgForLoad = async (
    url: string,
    start: number
): Promise<Uint8Array> => {
    const prg = await fetchBinaryData(url);

    // webapi_fileheader_t
    const fileheader = new Uint8Array([
        ..."CHIPPRG ".split("").map((char) => char.charCodeAt(0)),
        start & 255,
        start >> 8,
        0, // TODO: Flags
        0, // resvd 0
        0, // resvd 1
        0, // resvd 2
        0, // resvd 3
        0, // resvd 4
    ]);

    const data = new Uint8Array(fileheader.length + prg.length);
    data.set(fileheader, 0);
    data.set(prg, fileheader.length);

    return data;
};

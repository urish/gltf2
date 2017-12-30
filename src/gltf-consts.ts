// tslint:disable:object-literal-sort-keys

export const WebGLTypes = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
};

export const WebGLSizes = {
    [WebGLTypes.BYTE]: 1,
    [WebGLTypes.UNSIGNED_BYTE]: 1,
    [WebGLTypes.SHORT]: 2,
    [WebGLTypes.UNSIGNED_SHORT]: 2,
    [WebGLTypes.UNSIGNED_INT]: 4,
    [WebGLTypes.FLOAT]: 4,
};

export const WebGLComponentCounts: {[key: string]: number} = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};

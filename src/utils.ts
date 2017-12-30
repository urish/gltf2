import { WebGLComponentCounts, WebGLSizes } from './gltf-consts';

export function elementSize(type: string, componentType: number) {
    return WebGLComponentCounts[type] * WebGLSizes[componentType];
}

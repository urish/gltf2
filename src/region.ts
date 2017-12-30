import { BufferView, GltfAsset } from './gltf-types';

export interface BufferRegion {
  end: number;
  start: number;
}

export function toRegion(bufferView: BufferView): BufferRegion {
  return {
    end: (bufferView.byteOffset || 0) + bufferView.byteLength,
    start: (bufferView.byteOffset || 0),
  };
}

export function combineIntersectingRegions(regions: BufferRegion[]) {
  const result = [];
  let currentRegion = null;
  const sortedRegions = regions.slice().sort((a, b) => a.start - b.start);
  for (const region of sortedRegions) {
    if (!currentRegion) {
      currentRegion = region;
    } else {
      if (currentRegion.end < region.start) {
        result.push(currentRegion);
        currentRegion = region;
      } else {
        currentRegion.end = Math.max(currentRegion.end, region.end);
      }
    }
  }
  if (currentRegion) {
    result.push(currentRegion);
  }
  return result;
}

export function findGaps(sortedRegions: BufferRegion[], totalSize: number) {
  let prevRegion: BufferRegion = { start: 0, end: 0 };
  const result = [];
  for (const region of sortedRegions) {
    if (prevRegion.end < region.start) {
      result.push({ start: prevRegion.end, end: region.start });
    }
    prevRegion = region;
  }
  if (prevRegion.end < totalSize) {
    result.push({ start: prevRegion.end, end: totalSize });
  }
  return result;
}

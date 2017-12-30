import * as fs from 'fs';
import * as path from 'path';

import { BufferView, GltfAsset } from './gltf-types';
import { BufferRegion, combineIntersectingRegions, findGaps, toRegion } from './region';

export class GLTFReader {
  readonly gltf: GltfAsset;
  private readonly bufferData: Uint8Array[] = [];

  constructor(file: string) {
    this.gltf = JSON.parse(fs.readFileSync(file, 'utf-8'));
    this.bufferData = [];
    if (this.gltf.buffers) {
      const dir = path.dirname(file);
      for (const bufferInfo of this.gltf.buffers) {
        if (bufferInfo.uri) {
          this.bufferData.push(new Uint8Array(fs.readFileSync(path.resolve(dir, bufferInfo.uri))));
        } else {
          throw new Error('Missing buffer info');
        }
      }
    }
  }

  save(file: string, bufferFilePrefix = null as string | null) {
    if (!bufferFilePrefix) {
      bufferFilePrefix = file.replace(/\.[^.]+$/, '');
    }
    if (this.gltf.buffers) {
      for (let i = 0; i < this.gltf.buffers.length; i++) {
        const bufferFileName = `${bufferFilePrefix}-${i}.bin`;
        fs.writeFileSync(bufferFileName, this.bufferData[i]);
        this.gltf.buffers[i].uri = path.basename(bufferFileName);
      }
    }

    fs.writeFileSync(file, JSON.stringify(this.gltf, null, 2));
  }

  readBufferView(index: number, offset = 0, length: number | null = null) {
    if (!this.gltf.bufferViews) {
      throw new Error('No buffer views defined in glTF file');
    }

    const bufferView = this.gltf.bufferViews[index];
    if (length != null) {
      if (offset + length > bufferView.byteLength) {
        throw new Error("Can't read beyond the end of a BufferView");
      }
    } else {
      length = bufferView.byteLength - offset;
    }
    const buffer = this.bufferData[bufferView.buffer];
    if (bufferView.byteOffset) {
      offset += bufferView.byteOffset;
    }
    return new Uint8Array(buffer.slice(offset, offset + length));
  }

  visitBufferViewUsers(visitor: (element: { bufferView: number }) => void) {
    for (const accessor of this.gltf.accessors || []) {
      if (accessor.bufferView) {
        visitor(accessor as { bufferView: number });
      }

      if (accessor.sparse && accessor.sparse.indices.bufferView) {
        visitor(accessor.sparse.indices as { bufferView: number });
      }
    }
  }

  unusedBufferViews() {
    const result = new Set<number>();
    if (this.gltf.bufferViews) {
      for (let i = 0; i < this.gltf.bufferViews.length; i++) {
        result.add(i);
      }
      this.visitBufferViewUsers((e) => result.delete(e.bufferView));
    }
    return result;
  }

  removeBufferView(index: number) {
    if (!this.gltf.bufferViews || !this.gltf.bufferViews[index]) {
      throw new Error(`BufferView ${index} does not exist in file`);
    }

    // First, check that the buffer view is not used
    if (!this.unusedBufferViews().has(index)) {
      throw new Error(`Can't delete BufferView ${index}, because it is in use`);
    }

    this.gltf.bufferViews.splice(index, 1);

    this.visitBufferViewUsers((ref) => {
      if (ref.bufferView > index) {
        ref.bufferView--;
      }
    });
  }

  combineAllBuffers() {
    if (this.gltf.buffers && this.bufferData.length > 1) {
      const totalLength = this.bufferData.reduce((sum, buf) => sum + buf.length, 0);
      const bufferOffsets = this.bufferData.reduce((result, buf) => [...result, buf.length], [0]);
      const newBuffer = new Uint8Array(totalLength);
      for (let i = 0; i < this.bufferData.length; i++) {
        newBuffer.set(this.bufferData[i], bufferOffsets[i]);
      }
      this.bufferData.splice(0, this.bufferData.length, newBuffer);
      if (this.gltf.bufferViews) {
        for (const bufferView of this.gltf.bufferViews) {
          bufferView.byteOffset = bufferOffsets[bufferView.buffer] + (bufferView.byteOffset || 0);
        }
      }
      this.gltf.buffers[0].byteLength = totalLength;
    }
  }

  compactBuffers() {
    if (!this.gltf.bufferViews || !this.gltf.buffers) {
      return;
    }

    this.combineAllBuffers();
    const currentBuffer = this.bufferData[0];

    // Find unused regions
    const regions = combineIntersectingRegions(this.gltf.bufferViews.map(toRegion));
    const gaps = findGaps(regions, currentBuffer.length);

    // Compact
    const savedSpace = gaps.reduce((sum, gap) => sum + (gap.end - gap.start), 0);
    const newBuffer = new Uint8Array(currentBuffer.length - savedSpace);
    const regionMap = new Map<BufferRegion, number>();
    let newBufferIndex = 0;
    for (const region of regions) {
      regionMap.set(region, newBufferIndex);
      newBuffer.set(currentBuffer.slice(region.start, region.end), newBufferIndex);
      newBufferIndex += region.end - region.start;
    }
    for (const bufferView of this.gltf.bufferViews) {
      const bufferRegion = toRegion(bufferView);
      const region = regions.find((r) => (bufferRegion.start >= r.start) && (bufferRegion.end <= r.end));
      if (!region || (region.start > 0 && !bufferView.byteOffset)) {
        throw new Error('BufferView not in any region, or does not have a byteOffset');
      }
      const mappedRegion = regionMap.get(region);
      if (typeof mappedRegion === 'undefined') {
        throw new Error("mappedRegion does not exist for the given region - this shouldn't happen");
      }
      if (bufferView.byteOffset) {
        bufferView.byteOffset -= region.start - mappedRegion;
      }
    }
    this.bufferData[0] = newBuffer;
    this.gltf.buffers[0].byteLength = newBuffer.length;

    return savedSpace;
  }

  removeAccessorsMinMax() {
    if (this.gltf.accessors) {
      for (const accessor of this.gltf.accessors) {
        delete accessor.min;
        delete accessor.max;
      }
    }
  }
}

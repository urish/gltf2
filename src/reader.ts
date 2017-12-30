import * as fs from 'fs';
import * as path from 'path';

import { GltfAsset } from './gltf-types';

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
          this.bufferData.push(new Uint8Array(fs.readFileSync(bufferInfo.uri)));
        } else {
          throw new Error('Missing buffer info');
        }
      }
    }
  }

  readBufferView(index: number, offset = 0, length: number | null = null) {
    if (!this.gltf.bufferViews) {
      throw new Error('No buffer views defined in glTF file');
    }

    const bufferView = this.gltf.bufferViews[index];
    if (length != null) {
      if (offset + length < bufferView.byteLength) {
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
}

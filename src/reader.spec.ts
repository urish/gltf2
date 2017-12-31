import * as path from 'path';

import { GLTFReader } from './reader';

describe('Reader', () => {
  it('should successfully load a bare-minimum gltf file', () => {
    const reader = new GLTFReader(path.join(__dirname, '../fixtures/minimal.gltf'));
    expect(reader.gltf.asset.version).toEqual('2.0');
  });

  describe('readBufferView', () => {
    it('should return the content of a given buffer view index', () => {
      const reader = new GLTFReader(path.join(__dirname, '../fixtures/external-buffer.gltf'));
      const buffer = reader.readBufferView(0);
      expect(buffer).toEqual(new Uint8Array('helloworld123456'.split('').map((c) => c.charCodeAt(0))));
    });

    it('should return the content of a given buffer view index starting from a given offset', () => {
      const reader = new GLTFReader(path.join(__dirname, '../fixtures/external-buffer.gltf'));
      const buffer = reader.readBufferView(0, 5);
      expect(buffer).toEqual(new Uint8Array('world123456'.split('').map((c) => c.charCodeAt(0))));
    });

    it('should return the content of a buffer view spanning just part of the buffer', () => {
      const reader = new GLTFReader(path.join(__dirname, '../fixtures/external-buffer.gltf'));
      const buffer = reader.readBufferView(1);
      expect(buffer).toEqual(new Uint8Array('1234'.split('').map((c) => c.charCodeAt(0))));
    });

    it('should throw an error when trying to read past the end of a BufferView', () => {
      const reader = new GLTFReader(path.join(__dirname, '../fixtures/external-buffer.gltf'));
      const readIt = () => reader.readBufferView(0, 10, 7);
      expect(readIt).toThrow("Can't read beyond the end of a BufferView");
    });

    it('should throw an error if no buffers are defined in the file', () => {
      const reader = new GLTFReader(path.join(__dirname, '../fixtures/minimal.gltf'));
      const readIt = () => reader.readBufferView(0);
      expect(readIt).toThrow('No buffer views defined in glTF file');
    });
  });
});

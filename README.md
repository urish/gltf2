# gltf2 utils

[![Build Status](https://travis-ci.org/urish/gltf2.png?branch=master)](https://travis-ci.org/urish/gltf2)

Utils for processing [glTF 2.0](https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md) 3D model files.

## Usage example

```typescript

import { GLTFReader } from 'gltf2';

const model = new GLTFReader('input.gltf');

if (model.gltf.textures) {
  console.log('Texture count:', model.gltf.textures.length);
}

// This will remove unused data from glTF buffers
const savedSpace = model.compactBuffers();
console.log('saved', savedSpace, 'bytes');

model.save('output.gltf');

```

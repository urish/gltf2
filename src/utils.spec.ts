import { elementSize } from './utils';

describe('utils', () => {
  describe('elementSize', () => {
    it('should return 16 for MAT4 of bytes', () => {
      expect(elementSize('MAT4', 5120)).toBe(16);
    });

    it('should return 32 for MAT4 of shorts', () => {
      expect(elementSize('MAT4', 5122)).toBe(32);
    });

    it('should return 64 for MAT4 of floats', () => {
      expect(elementSize('MAT4', 5126)).toBe(64);
    });
  });
});

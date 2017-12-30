import { combineIntersectingRegions, findGaps, toRegion } from './region';

describe('region', () => {
  describe('toRegion()', () => {
    it('should convert the given bufferView to region', () => {
      expect(toRegion({ buffer: 0, byteOffset: 500, byteLength: 16 })).toEqual({ start: 500, end: 516 });
    });

    it('should accept bufferView without a byteOffset field', () => {
      expect(toRegion({ buffer: 0, byteLength: 32 })).toEqual({ start: 0, end: 32 });
    });
  });

  describe('#combineIntersectingRegions', () => {
    it('should combine all intersecting regions in the given list', () => {
      const regions = [
        { start: 1200, end: 1200 },
        { start: 550, end: 560 },
        { start: 500, end: 555 },
        { start: 558, end: 780 },
        { start: 650, end: 800 },
        { start: 600, end: 700 },
        { start: 1000, end: 1150 },
        { start: 950, end: 1200 },
      ];
      expect(combineIntersectingRegions(regions)).toEqual([{ start: 500, end: 800 }, { start: 950, end: 1200 }]);
    });

    it('should return an empty list given no regions', () => {
      expect(combineIntersectingRegions([])).toEqual([]);
    });
  });

  describe('findGaps', () => {
    it('should return a list of gaps, given a sorted list of regions and total buffer size', () => {
      expect(findGaps([{start: 200, end: 350}, {start: 500, end: 880}], 1000))
        .toEqual([{start: 0, end: 200}, {start: 350, end: 500}, {start: 880, end: 1000}]);
    });

    it('should not create an empty gap if the first region starts from 0', () => {
      expect(findGaps([{start: 0, end: 350}], 1000)).toEqual([{start: 350, end: 1000}]);
    });

    it('should return an empty list if the regions span the entire buffer area', () => {
      expect(findGaps([{start: 0, end: 1000}], 1000)).toEqual([]);
    });

    it('should return the entire buffer area given an empty list', () => {
      expect(findGaps([], 1500)).toEqual([{start: 0, end: 1500}]);
    });
  });
});

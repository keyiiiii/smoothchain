// tslint:disable:no-magic-numbers
import { getCurrentTimestamp } from './date';

Date.now = jest.fn(() => 1534927875797);

describe('utils date', () => {
  describe('getCurrentTimestamp', () => {
    it('正しい値が取得できるか', () => {
      expect(getCurrentTimestamp()).toEqual(1534927876);
    });
  });
});
// tslint:enable:no-magic-numbers

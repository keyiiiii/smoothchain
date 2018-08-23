// tslint:disable:no-magic-numbers
import { getBlockchain, getGenesisBlock } from './history';

describe('history', () => {
  describe('getGenesisBlock', () => {
    it('正しい値が取得できるか', () => {
      const result = {
        data: {},
        difficulty: 10,
        hash:
          '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
        index: 0,
        nonce: 0,
        previousHash: '0',
        timestamp: 1465154705,
      };
      expect(getGenesisBlock()).toEqual(result);
    });
  });

  describe('getBlockchain', () => {
    it('正しい値が取得できるか', () => {
      const result = [
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 0,
          nonce: 0,
          previousHash: '0',
          timestamp: 1465154705,
        },
      ];
      expect(getBlockchain()).toEqual(result);
    });

    it('正しい値に上書きできるか', () => {
      const newBlockchain = [
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 1,
          nonce: 1,
          previousHash: '0',
          timestamp: 1465154705,
        },
      ];
      expect(getBlockchain(newBlockchain)).toEqual(newBlockchain);
    });
  });
});
// tslint:enable:no-magic-numbers

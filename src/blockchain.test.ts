// tslint:disable:no-magic-numbers
import {
  calculateHashForBlock,
  generateNextBlock,
  getAdjustedDifficulty,
  getDifficulty,
  getLatestBlock,
  isValidBlockStructure,
  isValidChain,
  isValidNewBlock,
} from './blockchain';
import { MINING } from './constant';

jest.mock('./history', () => ({
  getGenesisBlock: () => {
    return {
      index: 1,
      previousHash: '1234',
      timestamp: 1234,
      data: {},
      hash: '5678',
      nonce: 1,
      difficulty: 10,
    };
  },
}));

jest.mock('./utils/date', () => ({
  getCurrentTimestamp: () => 1534927876,
}));

describe('blockchain', () => {
  describe('getLatestBlock', () => {
    it('正しい値が取得できるか', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1234,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 2,
          previousHash: '5678',
          timestamp: 5678,
          data: {},
          hash: '9012',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 3,
          previousHash: '9012',
          timestamp: 9012,
          data: {},
          hash: '3456',
          nonce: 1,
          difficulty: 10,
        },
      ];
      expect(getLatestBlock(blockchain)).toEqual(blockchain[2]);
    });

    it('blockchain が空のとき', () => {
      const blockchain = [];
      expect(getLatestBlock(blockchain)).toEqual(undefined);
    });

    it('blockchain が 1つだけあるとき', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1234,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      expect(getLatestBlock(blockchain)).toEqual(blockchain[0]);
    });
  });

  describe('calculateHashForBlock', () => {
    it('正しい値が取得できるか', () => {
      const block = {
        index: 1,
        previousHash: '1234',
        timestamp: 1234,
        data: {},
        hash: '5678',
        nonce: 1,
        difficulty: 10,
      };
      const result =
        '6dae134f6e698502e76519b89239d3826c8d07853d1966c23452361211352f8e';
      expect(calculateHashForBlock(block)).toEqual(result);
    });
  });

  describe('generateNextBlock', () => {
    it('正しい値が取得できるか', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1234,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      const blockData = {
        transfer: {
          from: '',
          to: '',
          value: 0,
          assetId: '',
          message: '',
        },
      };
      const result = {
        data: {
          transfer: { assetId: '', from: '', message: '', to: '', value: 0 },
        },
        difficulty: 10,
        hash:
          '002d058a5837edfbfff645dfb3064d80d13062cd4897861c32c4d4e6349fda65',
        index: 2,
        nonce: 1405,
        previousHash: '5678',
        timestamp: 1534927876,
      };
      expect(generateNextBlock(blockchain, blockData)).toEqual(result);
    });
  });

  describe('getDifficulty', () => {
    it('正しい値が取得できるか', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1234,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      const result = 10;
      expect(getDifficulty(blockchain)).toEqual(result);
    });
  });

  describe('getAdjustedDifficulty', () => {
    it('正しく難易度調整が上がるか', () => {
      const block = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash: '5678',
        nonce: 1,
        difficulty: 10,
      };
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1534927876,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 2,
          previousHash: '5678',
          timestamp: 1534927876,
          data: {},
          hash: '9012',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 3,
          previousHash: '9012',
          timestamp: 1534927876,
          data: {},
          hash: '3456',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 4,
          previousHash: '3456',
          timestamp: 1534927876,
          data: {},
          hash: '7890',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 5,
          previousHash: '7890',
          timestamp: 1534927877,
          data: {},
          hash: '1234',
          nonce: 1,
          difficulty: 10,
        },
      ];
      const result = 11;
      expect(getAdjustedDifficulty(block, blockchain)).toEqual(result);
    });
    it('正しく難易度調整が下がるか', () => {
      const timeExpected =
        MINING.BLOCK_GENERATION_INTERVAL *
        MINING.DIFFICULTY_ADJUSTMENT_INTERVAL *
        MINING.INTERVAL_RANGE;
      const block = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876 + timeExpected + 1,
        data: {},
        hash: '5678',
        nonce: 1,
        difficulty: 10,
      };
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1534927876,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 2,
          previousHash: '5678',
          timestamp: 1534927876,
          data: {},
          hash: '9012',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 3,
          previousHash: '9012',
          timestamp: 1534927876,
          data: {},
          hash: '3456',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 4,
          previousHash: '3456',
          timestamp: 1534927876,
          data: {},
          hash: '7890',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 5,
          previousHash: '7890',
          timestamp: 1534927876,
          data: {},
          hash: '1234',
          nonce: 1,
          difficulty: 10,
        },
      ];
      const result = 9;
      expect(getAdjustedDifficulty(block, blockchain)).toEqual(result);
    });
  });

  describe('isValidBlockStructure', () => {
    it('true が返るか', () => {
      const block = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash: '5678',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidBlockStructure(block)).toBeTruthy();
    });
  });

  describe('isValidNewBlock', () => {
    it('true が返るか', () => {
      const newBlock = {
        index: 2,
        previousHash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        timestamp: 1534927877,
        data: {},
        hash:
          '393f752b92f7a77f351e5378de4ab91a81a4129d557711d835d15e772ca33271',
        nonce: 1,
        difficulty: 10,
      };
      const previousBlock = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidNewBlock(newBlock, previousBlock)).toBeTruthy();
    });

    it('invalid index', () => {
      const newBlock = {
        index: 3,
        previousHash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        timestamp: 1534927877,
        data: {},
        hash:
          '393f752b92f7a77f351e5378de4ab91a81a4129d557711d835d15e772ca33271',
        nonce: 1,
        difficulty: 10,
      };
      const previousBlock = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidNewBlock(newBlock, previousBlock)).toBeFalsy();
    });

    it('invalid previousHash', () => {
      const newBlock = {
        index: 2,
        previousHash:
          '393f752b92f7a77f351e5378de4ab91a81a4129d557711d835d15e772ca33271',
        timestamp: 1534927877,
        data: {},
        hash:
          '393f752b92f7a77f351e5378de4ab91a81a4129d557711d835d15e772ca33271',
        nonce: 1,
        difficulty: 10,
      };
      const previousBlock = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidNewBlock(newBlock, previousBlock)).toBeFalsy();
    });

    it('invalid timestamp', () => {
      const newBlock = {
        index: 2,
        previousHash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        timestamp: 1534926876,
        data: {},
        hash:
          '393f752b92f7a77f351e5378de4ab91a81a4129d557711d835d15e772ca33271',
        nonce: 1,
        difficulty: 10,
      };
      const previousBlock = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidNewBlock(newBlock, previousBlock)).toBeFalsy();
    });

    it('invalid hash', () => {
      const newBlock = {
        index: 2,
        previousHash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        timestamp: 1534927877,
        data: {},
        hash: 'hash',
        nonce: 1,
        difficulty: 10,
      };
      const previousBlock = {
        index: 1,
        previousHash: '1234',
        timestamp: 1534927876,
        data: {},
        hash:
          '9cb3bee0d5d525a0c87db5c6fd85e8ad66a18389968693c1fcb6b14a19d3e64c',
        nonce: 1,
        difficulty: 10,
      };
      expect(isValidNewBlock(newBlock, previousBlock)).toBeFalsy();
    });
  });

  describe('isValidChain', () => {
    it('true かどうか', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 1234,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      expect(isValidChain(blockchain)).toBeTruthy();
    });

    it('genesisBlock がおかしい場合', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 5678,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      expect(isValidChain(blockchain)).toBeFalsy();
    });

    it('blockchain が壊れている場合', () => {
      const blockchain = [
        {
          index: 1,
          previousHash: '1234',
          timestamp: 5678,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
        {
          index: 1,
          previousHash: '1234',
          timestamp: 5678,
          data: {},
          hash: '5678',
          nonce: 1,
          difficulty: 10,
        },
      ];
      expect(isValidChain(blockchain)).toBeFalsy();
    });
  });
});
// tslint:enable:no-magic-numbers

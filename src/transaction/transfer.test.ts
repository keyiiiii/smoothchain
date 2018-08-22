// tslint:disable:no-magic-numbers
import { swapTransfer, transfer } from './transfer';

jest.mock('../state/account', () => ({
  transferValue: () => {},
}));

jest.mock('../state/assets', () => ({
  getAsset: (optionType: any) => {
    return {
      from: '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
      id: optionType,
      name: 'name',
      description: 'hoge',
      total: 10000,
      decimals: 0,
      optional: {
        [optionType]: true,
      },
    };
  },
}));

jest.mock('../main', () => ({
  generateBlock: (data: any) => {
    return {
      index: 1,
      previousHash: '1234',
      timestamp: 1234,
      data,
      hash: '5678',
      nonce: 1,
      difficulty: 10,
    };
  },
}));

jest.mock('./optional/levy', () => ({
  levyTransfer: (_: any, __: any) => {
    return {
      index: 1,
      previousHash: '1234',
      timestamp: 1234,
      data: {},
      hash: 'levy',
      nonce: 1,
      difficulty: 10,
    };
  },
}));

jest.mock('./optional/cashback', () => ({
  cashbackTransfer: (_: any, __: any) => {
    return {
      index: 1,
      previousHash: '1234',
      timestamp: 1234,
      data: {},
      hash: 'cashback',
      nonce: 1,
      difficulty: 10,
    };
  },
}));

jest.mock('../constant', () => ({
  NATIVE_TOKEN: {
    FROM: '31a8aef627cee39a920332076cee5b36560fae727dbdac17911614b37b7f5a77',
  },
}));

describe('transaction transfer', () => {
  describe('swapTransfer', () => {
    it('正しい値が取得できるか', () => {
      const payload = {
        sellTransaction: {
          from: 'A',
          to: 'B',
          assetId: 'assetId1',
          value: 100,
        },
        buyTransaction: {
          from: 'B',
          to: 'A',
          assetId: 'assetId2',
          value: 200,
        },
      };
      const result = [
        {
          data: {
            transfer: {
              assetId: 'assetId1',
              from: 'A',
              message: '',
              to: 'B',
              value: 100,
            },
          },
          difficulty: 10,
          hash: '5678',
          index: 1,
          nonce: 1,
          previousHash: '1234',
          timestamp: 1234,
        },
        {
          data: {
            transfer: {
              assetId: 'assetId2',
              from: 'B',
              message: '',
              to: 'A',
              value: 200,
            },
          },
          difficulty: 10,
          hash: '5678',
          index: 1,
          nonce: 1,
          previousHash: '1234',
          timestamp: 1234,
        },
      ];
      expect(swapTransfer(payload)).toEqual(result);
    });
  });

  describe('transfer', () => {
    it('正しい値が取得できるか: transferable', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        to: 'B',
        seed: 'seed',
        message: '',
        assetId: 'transferable',
        value: 100,
      };
      const result = {
        data: {
          transfer: {
            assetId: 'transferable',
            from:
              '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            message: '',
            to: 'B',
            value: 100,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload)).toEqual(result);
    });

    it('正しい値が取得できるか: levy', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        to: 'B',
        seed: 'seed',
        message: '',
        assetId: 'levy',
        value: 100,
      };
      const result = {
        data: {},
        difficulty: 10,
        hash: 'levy',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload)).toEqual(result);
    });

    it('正しい値が取得できるか: cashback', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        to: 'B',
        seed: 'seed',
        message: '',
        assetId: 'cashback',
        value: 100,
      };
      const result = {
        data: {},
        difficulty: 10,
        hash: 'cashback',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload)).toEqual(result);
    });

    it('transferable じゃない asset は from か to が asset.from に一致する必要がある', () => {
      const payload = {
        from:
          'df9ecf4c79e5ad77701cfc88c196632b353149d85810a381f469f8fc05dc1b92',
        to: 'B',
        seed: 'seed1',
        message: '',
        assetId: 'cashback',
        value: 100,
      };

      expect(() => transfer(payload)).toThrowError('METHOD_NOT_ALLOWED');
    });

    it('seed とアドレスが一致しない場合は弾く', () => {
      const payload = {
        from: 'address',
        to: 'B',
        seed: 'seed',
        message: '',
        assetId: 'transferable',
        value: 100,
      };

      expect(() => transfer(payload)).toThrowError('UNAUTHORIZED');
    });

    it('escrow アカウントの時は optional を無視する', () => {
      const payload = {
        from:
          'esc19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        to: '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        seed: 'seed',
        message: '',
        assetId: 'levy',
        value: 100,
      };
      const result = {
        data: {
          transfer: {
            assetId: 'levy',
            from:
              'esc19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            message: '',
            to:
              '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            value: 100,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload)).toEqual(result);
    });

    it('owner 権限を持っている場合は seed とアドレスが一致しなくても弾かない', () => {
      const payload = {
        from: 'A',
        to: 'B',
        seed: '',
        message: '',
        assetId: 'transferable',
        value: 100,
      };
      const owner = {
        address:
          '31a8aef627cee39a920332076cee5b36560fae727dbdac17911614b37b7f5a77',
        seed: 'ownerSeed',
      };
      const result = {
        data: {
          transfer: {
            assetId: 'transferable',
            from: 'A',
            message: '',
            to: 'B',
            value: 100,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload, owner)).toEqual(result);
    });

    it('owner 権限を持っている場合は optional を無視する', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        to: 'B',
        seed: '',
        message: '',
        assetId: 'levy',
        value: 100,
      };
      const owner = {
        address:
          '31a8aef627cee39a920332076cee5b36560fae727dbdac17911614b37b7f5a77',
        seed: 'ownerSeed',
      };
      const result = {
        data: {
          transfer: {
            assetId: 'levy',
            from:
              '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            message: '',
            to: 'B',
            value: 100,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(transfer(payload, owner)).toEqual(result);
    });
  });
});
// tslint:enable:no-magic-numbers

// tslint:disable:no-magic-numbers
import { assetsIssue } from './asset';

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

jest.mock('../state/assets', () => ({
  putAssets: (_: any) => {},
}));

jest.mock('../state/account', () => ({
  postAccount: (_: any, __: any) => {},
}));

Date.now = jest.fn(() => 1534927875797);

describe('transaction asset', () => {
  describe('assetsIssue', () => {
    it('seed とアドレスが一致しない場合は弾く', () => {
      const payload = {
        from: 'address',
        seed: 'seed',
        name: 'name',
        description: 'hoge',
        optional: {},
        total: '10000',
        decimals: '0',
      };
      expect(() => assetsIssue(payload)).toThrowError('UNAUTHORIZED');
    });

    it('正しい値が取得できるか', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        seed: 'seed',
        name: 'name',
        description: 'hoge',
        optional: {},
        total: '10000',
        decimals: '0',
      };
      const result = {
        data: {
          assets: {
            decimals: 0,
            description: 'hoge',
            from:
              '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            id:
              '1da8cf1b9a9862efe740d3168db0891a77be91cd7d3030e173705cde7db0eab4',
            name: 'name',
            optional: {},
            total: 10000,
            children: [],
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(assetsIssue(payload)).toEqual(result);
    });

    it('children 正しい値が取得できるか', () => {
      const payload = {
        from:
          '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
        seed: 'seed',
        name: 'name',
        description: 'hoge',
        optional: {},
        total: '10000',
        decimals: '0',
        children: [
          {
            from: '1',
            name: 'child',
            description: 'NFT',
            optional: {},
            total: '100',
            decimals: '0',
          },
        ],
      };
      const result = {
        data: {
          assets: {
            children: [
              {
                children: [],
                decimals: 0,
                description: 'NFT',
                from: '1',
                id:
                  '0039e10a15f591b748f93dcd1b0ef1d719dd96e18b274083c241db05219872c3',
                name: 'child',
                optional: {},
                total: 100,
              },
            ],
            decimals: 0,
            description: 'hoge',
            from:
              '19b25856e1c150ca834cffc8b59b23adbd0ec0389e58eb22b3b64768098d002b',
            id:
              '1da8cf1b9a9862efe740d3168db0891a77be91cd7d3030e173705cde7db0eab4',
            name: 'name',
            optional: {},
            total: 10000,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(assetsIssue(payload)).toEqual(result);
    });
  });
});

// tslint:enable:no-magic-numbers

// tslint:disable:no-magic-numbers
import { cashbackTransfer } from './cashback';

jest.mock('../../state/account', () => ({
  transferValue: () => {},
}));

jest.mock('../../main', () => ({
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

describe('transaction optional: cashback', () => {
  describe('cashbackTransfer', () => {
    it('送金者とトークン発行者が同じ場合はキャッシュバックを無視する', () => {
      const payload = {
        from: 'address',
        to: 'otherAddress',
        seed: '1234',
        message: '',
        assetId: 'id',
        value: 10,
      };
      const asset = {
        from: 'address',
        id: 'id',
        name: 'tokenName',
        description: 'hoge',
        total: 10000,
        decimals: 0,
        optional: {
          cashback: true,
        },
      };
      const result = {
        data: {
          transfer: {
            assetId: 'id',
            from: 'address',
            message: '',
            to: 'otherAddress',
            value: 10,
          },
        },
        difficulty: 10,
        hash: '5678',
        index: 1,
        nonce: 1,
        previousHash: '1234',
        timestamp: 1234,
      };
      expect(cashbackTransfer(payload, asset)).toEqual(result);
    });

    it('キャッシュバックが正しく行われるか', () => {
      const payload = {
        from: 'address2',
        to: 'otherAddress',
        seed: '1234',
        message: '',
        assetId: 'id',
        value: 10,
      };
      const asset = {
        from: 'address',
        id: 'id',
        name: 'tokenName',
        description: 'hoge',
        total: 10000,
        decimals: 0,
        optional: {
          cashback: true,
        },
      };
      const result = [
        {
          data: {
            transfer: {
              assetId: 'id',
              from: 'address',
              message: '',
              to: 'address2',
              value: 0,
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
              assetId: 'id',
              from: 'address2',
              message: '',
              to: 'otherAddress',
              value: 10,
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
      expect(cashbackTransfer(payload, asset)).toEqual(result);
    });

    it('assetId が違う場合', () => {
      const payload = {
        from: 'address2',
        to: 'otherAddress',
        seed: '1234',
        message: '',
        assetId: 'id',
        value: 10,
      };
      const asset = {
        from: 'address',
        id: 'otherId',
        name: 'tokenName',
        description: 'hoge',
        total: 10000,
        decimals: 0,
        optional: {
          cashback: true,
        },
      };
      expect(cashbackTransfer(payload, asset)).toBeFalsy();
    });
  });
});
// tslint:enable:no-magic-numbers

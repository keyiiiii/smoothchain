// tslint:disable:no-magic-numbers
import {
  deleteEscrow,
  getAgreementEscrow,
  getEscrowEscrowId,
  getEscrows,
  getEscrowsFrom,
  putEscrows,
  replaceEscrows,
} from './escrow';

const escrows = [];

beforeEach(() => {
  replaceEscrows(escrows);
});

const defaultEscrows = [
  {
    escrowId: '1234',
    from: 'address',
    sell: {
      assetId: 'A',
      value: 10,
    },
    buy: {
      assetId: 'B',
      value: 20,
    },
    timestamp: 1234,
  },
];

function addDefaultEscrow(): void {
  replaceEscrows(defaultEscrows);
}

jest.mock('../utils/date', () => ({
  getCurrentTimestamp: () => 1234,
}));

describe('state escrow', () => {
  describe('getEscrows', () => {
    it('初期値が正しいかどうか', () => {
      expect(getEscrows()).toEqual(escrows);
    });
  });

  describe('replaceEscrows', () => {
    it('正しい値が取得できるか', () => {
      const otherEscrows = [
        {
          escrowId: '1234',
          from: 'address',
          sell: {
            assetId: 'A',
            value: 10,
          },
          buy: {
            assetId: 'B',
            value: 20,
          },
          timestamp: 1234,
        },
      ];
      replaceEscrows(otherEscrows);
      expect(getEscrows()).toEqual(otherEscrows);
    });
  });

  describe('getEscrowsFrom', () => {
    const from = 'address';
    it('from が一致しないとき', () => {
      expect(getEscrowsFrom(from)).toEqual(escrows);
    });

    it('from が一致するとき', () => {
      addDefaultEscrow();
      expect(getEscrowsFrom(from)).toEqual(defaultEscrows);
    });
  });

  describe('getEscrowEscrowId', () => {
    const escrowId = '1234';
    it('escrowId が一致しないとき', () => {
      expect(getEscrowEscrowId(escrowId)).toEqual(undefined);
    });

    it('escrowId が一致するとき', () => {
      addDefaultEscrow();
      expect(getEscrowEscrowId(escrowId)).toEqual(defaultEscrows[0]);
    });
  });

  describe('deleteEscrow', () => {
    const escrowId = '1234';
    const from = 'address';
    it('一致する escrowId が見つからないとき', () => {
      expect(deleteEscrow(escrowId, from)).toEqual(escrows);
    });

    it('一致する from が見つからないとき', () => {
      addDefaultEscrow();
      expect(deleteEscrow(escrowId, 'address2')).toEqual(defaultEscrows);
    });

    it('正しい値が削除されるかどうか', () => {
      addDefaultEscrow();
      expect(deleteEscrow(escrowId, from)).toEqual(escrows);
    });
  });

  describe('getAgreementEscrow', () => {
    it('売りと買いが一致しない場合', () => {
      addDefaultEscrow();
      const sell = {
        assetId: 'C',
        value: 10,
      };
      const buy = {
        assetId: 'D',
        value: 20,
      };
      expect(getAgreementEscrow(sell, buy)).toEqual(undefined);
    });

    it('一致した escrow を取り出す', () => {
      addDefaultEscrow();
      const sell = {
        assetId: 'B',
        value: 20,
      };
      const buy = {
        assetId: 'A',
        value: 20,
      };
      expect(getAgreementEscrow(sell, buy)).toEqual(defaultEscrows[0]);
    });
  });

  describe('putEscrows', () => {
    it('正しく追加されるかどうか', () => {
      addDefaultEscrow();
      const payload = {
        from: 'address',
        seed: 'seed',
        sell: {
          assetId: 'C',
          value: 10,
        },
        buy: {
          assetId: 'D',
          value: 20,
        },
        timestamp: 5678,
      };
      const result = [
        {
          buy: {
            assetId: 'B',
            value: 20,
          },
          escrowId: '1234',
          from: 'address',
          sell: {
            assetId: 'A',
            value: 10,
          },
          timestamp: 1234,
        },
        {
          buy: {
            assetId: 'D',
            value: 20,
          },
          escrowId:
            '0a3364c86cad7f069a45f8a2fedbec7367ed5a85cff6f36372e52ff99ef8a7e8',
          from: 'address',
          sell: {
            assetId: 'C',
            value: 10,
          },
          timestamp: 1234,
        },
      ];
      putEscrows(payload);
      expect(getEscrows()).toEqual(result);
    });
  });
});
// tslint:enable:no-magic-numbers

// tslint:disable:no-magic-numbers
import {
  getAccountAssets,
  getAccounts,
  getValue,
  replaceAccounts,
} from './account';

const accounts = {
  '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f': [
    {
      address:
        'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
      value: 10000,
    },
  ],
};

const asset = [
  {
    decimals: 0,
    description: 'native token',
    from: '',
    id: '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f',
    name: 'native token',
    optional: {
      transferable: true,
    },
    total: 10000,
  },
];

describe('state account', () => {
  describe('getAccounts', () => {
    it('初期値が正しいかどうか', () => {
      expect(getAccounts()).toEqual(accounts);
    });
  });

  describe('replaceAccounts', () => {
    it('正しい値に置き換わるか 1', () => {
      const newAccounts = [
        {
          address: 'address',
          value: 0,
        },
      ];
      const assetId = 'assetId';
      replaceAccounts(newAccounts, assetId);

      const result = Object.assign({}, accounts, {
        assetId: newAccounts,
      });
      expect(getAccounts()).toEqual(result);
    });

    it('正しい値に置き換わるか 2', () => {
      const newAccounts = [
        {
          address: 'address',
          value: 2,
        },
      ];
      const assetId = 'assetId';
      replaceAccounts(newAccounts, assetId);

      const result = Object.assign({}, accounts, {
        assetId: newAccounts,
      });
      expect(getAccounts()).toEqual(result);
    });
  });

  describe('getAccountAssets', () => {
    it('正しい値が取得できるか', () => {
      expect(
        getAccountAssets(
          'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
        ),
      ).toEqual(asset);
    });
  });

  describe('getValue', () => {
    it('正しい値が取得できるか', () => {
      expect(
        getValue(
          'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
          '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f',
        ),
      ).toEqual(10000);
    });
  });
});
// tslint:enable:no-magic-numbers

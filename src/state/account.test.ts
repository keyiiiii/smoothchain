// tslint:disable:no-magic-numbers
import {
  getAccountAssets,
  getAccounts,
  getValue,
  postAccount,
  putAccount,
  replaceAccounts,
  transferValue,
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
    children: [],
    decimals: 0,
    description: 'native token',
    from: '',
    id: '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f',
    name: 'native token',
    optional: { transferable: true },
    total: 10000,
  },
];

beforeEach(() => {
  const account = {
    address: 'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
    value: 10000,
  };
  const assetId =
    '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f';
  replaceAccounts([account], assetId);
});

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

  describe('putAccount', () => {
    it('accounts にある場合は置き換え', () => {
      const account = {
        address:
          'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
        value: 1,
      };
      const assetId =
        '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f';
      const result = [account];
      putAccount(account, assetId);
      expect(getAccounts()[assetId]).toEqual(result);
    });

    it('accounts にない場合は追加', () => {
      const account = {
        address: 'address',
        value: 100,
      };
      const assetId = 'assetId';
      const result = [account];
      putAccount(account, assetId);
      expect(getAccounts()[assetId]).toEqual(result);
    });
  });

  describe('postAccount', () => {
    it('正しい値が取得できるか', () => {
      const account = {
        address: 'address',
        value: 200,
      };
      const assetId = 'assetId2';
      const result = [account];
      postAccount(account, assetId);
      expect(getAccounts()[assetId]).toEqual(result);
    });
  });

  describe('transferValue', () => {
    it('正しい値が取得できるか', () => {
      const assetId =
        '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f';
      const payload = {
        from:
          'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
        to: 'address',
        value: 100,
        assetId,
      };
      const result = [
        {
          address:
            'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
          value: 9900,
        },
        {
          address: 'address',
          value: 100,
        },
      ];
      transferValue(payload);
      expect(getAccounts()[assetId]).toEqual(result);
    });
  });
});
// tslint:enable:no-magic-numbers

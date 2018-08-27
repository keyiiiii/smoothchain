// tslint:disable:no-magic-numbers
import { getAssets, putAssets, replaceAssets, getAsset } from './assets';

const assets = [
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
  replaceAssets(assets);
});

describe('state assets', () => {
  describe('getAssets', () => {
    it('初期値が正しいかどうか', () => {
      expect(getAssets()).toEqual(assets);
    });
  });

  describe('replaceAssets', () => {
    it('正しい値が取得できるか', () => {
      const otherAssets = [
        {
          decimals: 0,
          description: 'other token',
          from: '',
          id: '1234',
          name: 'other token',
          optional: {
            transferable: false,
          },
          total: 1000000,
        },
      ];
      replaceAssets(otherAssets);
      expect(getAssets()).toEqual(otherAssets);
    });
  });

  describe('putAssets', () => {
    it('assets にある場合は置き換え', () => {
      const otherAsset = {
        decimals: 0,
        description: 'other token',
        from: '',
        id: '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f',
        name: 'other token',
        optional: {
          transferable: false,
        },
        total: 1000000,
      };
      const result = [otherAsset];
      putAssets(otherAsset);
      expect(getAssets()).toEqual(result);
    });

    it('assets にない場合は追加', () => {
      const otherAsset = {
        decimals: 0,
        description: 'other token',
        from: '',
        id: '1234',
        name: 'other token',
        optional: {
          transferable: false,
        },
        total: 1000000,
      };
      const result = [assets[0], otherAsset];
      putAssets(otherAsset);
      expect(getAssets()).toEqual(result);
    });
  });

  describe('getAsset', () => {
    const assetId =
      '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f';
    expect(getAsset(assetId)).toEqual(assets[0]);
  });
});
// tslint:enable:no-magic-numbers

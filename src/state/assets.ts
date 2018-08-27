/**
 * Assets State
 */

import { NATIVE_TOKEN } from '../constant';

export interface Optional {
  transferable?: boolean;
  levy?: boolean;
  cashback?: boolean;
  reissuable?: boolean;
}

export interface ChildAsset extends Asset {
  meta?: string;
  parentId: string;
}

export interface Asset {
  from: string;
  id: string;
  name: string;
  description: string;
  total: number;
  decimals: number;
  optional: Optional;
  children?: ChildAsset[];
}

// TODO: immutable にする
// 初期値
export let assets: Asset[] = [
  {
    id: NATIVE_TOKEN.ID,
    name: NATIVE_TOKEN.NAME,
    description: NATIVE_TOKEN.DESCRIPTION,
    total: NATIVE_TOKEN.TOTAL,
    decimals: NATIVE_TOKEN.DECIMALS,
    from: '',
    optional: {
      transferable: true,
    },
    children: [],
  },
];

// Assets の上書き
export function replaceAssets(newAssets: Asset[]): void {
  assets = newAssets;
}

// すべての Assets を返す
export function getAssets(): Asset[] {
  return [...assets];
}

// assets にない場合は追加、ある場合は置き換える
export function putAssets(putAsset: Asset): void {
  replaceAssets(getAssets().filter((asset: Asset) => asset.id !== putAsset.id));
  assets.push(putAsset);
  // TODO: reissue

  console.log('assets', assets);
}

export function getAsset(assetId: string): Asset {
  return getAssets().find((asset: Asset) => asset.id === assetId);
}

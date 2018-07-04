/**
 * Assets State
 */

import { NATIVE_TOKEN } from '../constant';

export interface Asset {
  id: string;
  name: string;
  description: string;
  total: number;
  decimals: number;
}

export type Assets = Asset[];

// TODO: immutable にする
// 初期値
export let assets: Assets = [
  {
    id: NATIVE_TOKEN.ID,
    name: NATIVE_TOKEN.NAME,
    description: NATIVE_TOKEN.DESCRIPTION,
    total: NATIVE_TOKEN.TOTAL,
    decimals: NATIVE_TOKEN.DECIMALS,
  },
];

// Assets の上書き
export function replaceAssets(newAssets: Assets): void {
  assets = newAssets;
}

// すべての Assets を返す
export function getAssets(): Assets {
  return [...assets];
}

export function putAssets(putAsset: Asset): void {
  replaceAssets(getAssets().filter((asset: Asset) => asset.id !== putAsset.id));
  assets.push(putAsset);

  console.log('assets', assets);
}

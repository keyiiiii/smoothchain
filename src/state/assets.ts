/**
 * Assets State
 */

import { NATIVE_TOKEN } from '../constant';

interface Asset {
  id: string;
  name: string;
  description: string;
  total: number;
  decimals: number;
}

type Assets = Asset[];

// TODO: immutable にする
// 初期値
export let assets: Assets = [
  {
    id: '',
    name: '',
    description: '',
    total: NATIVE_TOKEN.TOTAL,
    decimals: NATIVE_TOKEN.DECIMALS,
  }
];

// Assets の上書き
export function replaceAssets(newAssets: Assets): void {
  assets = newAssets;
}

// すべての Assets を返す
export function getAssets(): Assets {
  return [...assets];
}

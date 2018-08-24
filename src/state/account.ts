/**
 * Account State
 */

import { NATIVE_TOKEN } from '../constant';
import { Asset, ChildAsset, getAssets } from './assets';

interface Account {
  address: string;
  value: number;
}

interface AssetsAccount {
  [assetId: string]: Account[];
}

export interface PutAccountPayload {
  from: string;
  to: string;
  value: number;
  assetId: string;
}

// TODO: immutable にする
// 初期値
const accounts: AssetsAccount = {
  [NATIVE_TOKEN.ID]: [
    {
      address: NATIVE_TOKEN.FROM,
      value: NATIVE_TOKEN.TOTAL,
    },
  ],
};

// Accounts の上書き
export function replaceAccounts(newAccounts: Account[], assetId: string): void {
  accounts[assetId] = newAccounts;
}

// すべての Accounts を返す
export function getAccounts(): AssetsAccount {
  return Object.assign({}, accounts);
}

// Account に紐づく トークンリストを返す
// TODO: めっちゃループしまくってるのでそろそろDB使ったほうがいいかも
export function getAccountAssets(address: string): Asset[] {
  const assets = [];
  Object.keys(getAccounts()).forEach((assetId: string) => {
    getAccounts()[assetId].forEach((account: Account) => {
      if (account.address === address && account.value > 0) {
        getAssets().forEach((asset: Asset) => {
          if (asset.id === assetId) {
            assets.push(asset);
          } else {
            // child assets
            asset.children &&
              asset.children.forEach((childAsset: ChildAsset) => {
                if (childAsset.id === assetId) {
                  assets.push(childAsset);
                }
              });
          }
        });
      }
    });
  });
  return assets;
}

// address の残高を返す。accounts に存在しない場合は 0 を返す
export function getValue(address: string, assetId: string): number {
  if (!getAccounts()[assetId]) {
    return 0;
  }
  const account = getAccounts()[assetId].find(
    (account: Account) => account.address === address,
  );
  return account ? account.value : 0;
}

// accounts にない場合は追加、ある場合は置き換える
export function putAccount(putAccount: Account, assetId: string): void {
  if (!getAccounts()[assetId]) {
    return;
  }
  replaceAccounts(
    getAccounts()[assetId].filter(
      (account: Account) => account.address !== putAccount.address,
    ),
    assetId,
  );
  accounts[assetId].push(putAccount);
}

// accounts に追加
export function postAccount(postAccount: Account, assetId: string): void {
  accounts[assetId] = [postAccount];
}

// Account(from) の残高を確認して 残高 > 送る量 なら指定した Account に送金する
// TODO: 総量が TOTAL を超えないようにチェックする
export function transferValue(payload: PutAccountPayload): void {
  const { from, value, to, assetId } = payload;
  // asset情報を取得する
  if (getValue(from, assetId) >= value) {
    const fromAccount = {
      address: from,
      value: getValue(from, assetId) - value,
    };
    const toAccount = {
      address: to,
      value: getValue(to, assetId) + value,
    };
    putAccount(fromAccount, assetId);
    putAccount(toAccount, assetId);

    console.log('accounts', accounts);

    return;
  } else {
    throw new Error('failed transfer');
  }
}

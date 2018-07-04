/**
 * Account State
 */

import { NATIVE_TOKEN } from '../constant';
import { Asset, Assets, getAssets } from './assets';

interface Account {
  address: string;
  value: number;
}

interface AssetsAccount {
  [key: string]: Account[];
}

interface PutAccountPayload {
  from: string;
  to: string;
  value: number;
  tokenId?: string;
}

// TODO: immutable にする
// 初期値
const accounts: AssetsAccount = {
  [NATIVE_TOKEN.ID]: [
    {
      address:
        'd10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306',
      value: NATIVE_TOKEN.TOTAL,
    },
  ],
};

// Accounts の上書き
export function replaceAccounts(newAccounts: Account[], tokenId: string): void {
  accounts[tokenId] = newAccounts;
}

// すべての Accounts を返す
export function getAccounts(): AssetsAccount {
  return Object.assign({}, accounts);
}

// Account に紐づく トークンリストを返す
// TODO: めっちゃループしまくってるのでそろそろDB使ったほうがいいかも
export function getAccountAssets(address: string): Assets {
  const assets = [];
  Object.keys(getAccounts()).forEach((tokenId: string) => {
    getAccounts()[tokenId].forEach((account: Account) => {
      if (account.address === address && account.value > 0) {
        getAssets().forEach((asset: Asset) => {
          if (asset.id === tokenId) {
            assets.push(asset);
          }
        });
      }
    });
  });
  return assets;
}

// address の残高を返す。accounts に存在しない場合は 0 を返す
export function getValue(
  address: string,
  tokenId: string = NATIVE_TOKEN.ID,
): number {
  if (!getAccounts()[tokenId]) {
    return 0;
  }
  const account = getAccounts()[tokenId].find(
    (account: Account) => account.address === address,
  );
  return account ? account.value : 0;
}

// accounts にない場合は追加、ある場合は置き換える
export function putAccount(putAccount: Account, tokenId: string): void {
  if (!getAccounts()[tokenId]) {
    return;
  }
  replaceAccounts(
    getAccounts()[tokenId].filter(
      (account: Account) => account.address !== putAccount.address,
    ),
    tokenId,
  );
  accounts[tokenId] = [putAccount];
}

// accounts に追加
export function postAccount(postAccount: Account, tokenId: string): void {
  accounts[tokenId] = [postAccount];
}

// Account(from) の残高を確認して 残高 > 送る量 なら指定した Account に送金する
// TODO: 総量が TOTAL を超えないようにチェックする
export function transferValue(payload: PutAccountPayload): void {
  if (getValue(payload.from) >= payload.value) {
    const tokenId = payload.tokenId || NATIVE_TOKEN.ID;
    const fromAccount = {
      address: payload.from,
      value: getValue(payload.from) - payload.value,
    };
    const toAccount = {
      address: payload.to,
      value: getValue(payload.to) + payload.value,
    };
    putAccount(fromAccount, tokenId);
    putAccount(toAccount, tokenId);

    console.log('accounts', accounts);

    return;
  } else {
    throw new Error('failed transfer');
  }
}

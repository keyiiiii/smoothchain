/**
 * Account State
 */

import { NATIVE_TOKEN } from '../constant';

interface Account {
  address: string;
  value: number;
}

interface AssetsAccount {
  [key: string]: Account[];
}

// TODO: immutable にする
// 初期値
const accounts: AssetsAccount = {
  [NATIVE_TOKEN.ID]: [
    {
      address: "d10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306",
      value: NATIVE_TOKEN.TOTAL
    }
  ]
};

// Accounts の上書き
export function replaceAccounts(newAccounts: Account[], tokenId: string): void {
  accounts[tokenId] = newAccounts;
}

// すべての Accounts を返す
export function getAccounts(): AssetsAccount {
  return Object.assign({}, accounts);
}

// address の残高を返す。accounts に存在しない場合は 0 を返す
export function getValue(address: string, tokenId: string = NATIVE_TOKEN.ID): number {
  if (!getAccounts()[tokenId]) {
    return 0;
  }
  const account = getAccounts()[tokenId].find(
    (account: Account) => account.address === address,
  );
  return account ? account.value : 0;
}

// accounts にない場合は追加、ある場合は置き換える
export function putAccount(putAccount: Account, tokenId: string = NATIVE_TOKEN.ID): void {
  if (!getAccounts()[tokenId]) {
    return;
  }
  replaceAccounts(
    getAccounts()[tokenId].filter(
      (account: Account) => account.address !== putAccount.address,
    ),
    tokenId,
  );
  accounts[tokenId].push(putAccount);
}

// Account(from) の残高を確認して 残高 > 送る量 なら指定した Account に送金する
// TODO: 総量が NATIVE_TOKEN.TOTAL を超えないようにチェックする
export function transferValue(from: string, to: string, value: number): void {
  if (getValue(from) >= value) {
    const fromAccount = {
      address: from,
      value: getValue(from) - value,
    };
    const toAccount = {
      address: to,
      value: getValue(to) + value,
    };
    putAccount(fromAccount);
    putAccount(toAccount);

    console.log('accounts', accounts);
    return;
  } else {
    throw new Error('failed transfer');
  }
}

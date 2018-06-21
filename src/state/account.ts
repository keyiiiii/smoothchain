/**
 * Account State
 */

interface Account {
  address: string;
  value: number;
}

type Accounts = Account[];

// TODO: immutable にする
// 初期値
let accounts: Accounts = [
  {
    address: '1',
    value: 10000,
  },
];

// Accounts の上書き
export function replaceAccounts(newAccount: Accounts): void {
  accounts = newAccount;
}

// すべての Accounts を返す
export function getAccounts(): Accounts {
  return [...accounts];
}

// address の残高を返す。accounts に存在しない場合は 0 を返す
export function getValue(address: string): number {
  const account = getAccounts().find(
    (account: Account) => account.address === address,
  );
  return account ? account.value : 0;
}

// accounts にない場合は追加、ある場合は置き換える
export function putAccount(putAccount: Account): void {
  replaceAccounts(
    getAccounts().filter(
      (account: Account) => account.address !== putAccount.address,
    ),
  );
  accounts.push(putAccount);
}

// Account(from) の残高を確認して 残高 > 送る量 なら指定した Account に送金する
export function transferValue(from: string, to: string, value: number): void {
  if (getValue(from) > value) {
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

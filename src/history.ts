import { Block, Blockchain, Transfer } from './types';

export function createBlock(
  index: number,
  previousHash: string,
  timestamp: number,
  data: Transfer | {},
  hash: string,
): Block {
  return {
    index,
    previousHash,
    timestamp,
    data,
    hash,
  };
}

export function getGenesisBlock(): Block {
  return createBlock(
    0,
    '0',
    1465154705, // tslint:disable-line:no-magic-numbers
    {},
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
  );
}

// initialize blockchain
let blockchain = [getGenesisBlock()];

export function getBlockchain(newBlockchain?: Blockchain): Blockchain {
  if (newBlockchain) {
    blockchain = newBlockchain;
  }
  return blockchain;
}

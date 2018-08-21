import { Block, Blockchain, BlockData } from './types';

function createBlock(
  index: number,
  previousHash: string,
  timestamp: number,
  data: BlockData,
  hash: string,
  nonce: number,
  difficulty: number,
): Block {
  return {
    index,
    previousHash,
    timestamp,
    data,
    hash,
    nonce,
    difficulty,
  };
}

// tslint:disable:no-magic-numbers
export function getGenesisBlock(): Block {
  return createBlock(
    0,
    '0',
    1465154705,
    {},
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
    0,
    10,
  );
}
// tslint:enable:no-magic-numbers

// initialize blockchain
let blockchain = [getGenesisBlock()];

export function getBlockchain(newBlockchain?: Blockchain): Blockchain {
  if (newBlockchain) {
    blockchain = newBlockchain;
  }
  return blockchain;
}

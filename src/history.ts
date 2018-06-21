import { getGenesisBlock } from './blockchain';
import { Blockchain } from './types';

// initialize blockchain
let blockchain = [getGenesisBlock()];

export function getBlockchain(newBlockchain?: Blockchain): Blockchain {
  if (newBlockchain) {
    blockchain = newBlockchain;
  }
  return blockchain;
}

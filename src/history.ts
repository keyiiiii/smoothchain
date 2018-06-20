import { getGenesisBlock } from "./blockchain";
import { Blockchain } from './blockchain';

// initialize blockchain
let blockchain = [getGenesisBlock()];

export function getBlockchain(newBlockchain?: Blockchain): Blockchain {
  newBlockchain ? blockchain = newBlockchain : '';
  return blockchain;
}

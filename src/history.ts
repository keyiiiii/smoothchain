import { getGenesisBlock } from "./blockChain";
import { BlockChain } from './blockChain';

// initialize blockchain
let blockChain = [getGenesisBlock()];

export function getBlockchain(newBlockchain?: BlockChain): BlockChain {
  newBlockchain ? blockChain = newBlockchain : '';
  return blockChain;
}

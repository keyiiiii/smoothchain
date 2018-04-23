import SHA256 from 'crypto-js/sha256';

interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: string;
  hash: string;
}

type BlockChain = Block[];

export function getGenesisBlock(): Block {
  return createBlock(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
}

export function getLatestBlock(blockChain: BlockChain): Block {
  return blockChain[blockChain.length - 1];
}

export function createBlock(
  index: number,
  previousHash: string,
  timestamp: number,
  data: any,
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

export function calculateHashForBlock(block: Block) {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
  );
}

export function calculateHash(
  index: number,
  previousHash: string,
  timestamp: number,
  data: string = '',
): string {
  return SHA256(index + previousHash + timestamp + data).toString();
}

export function generateNextBlock(
  blockChain: BlockChain,
  blockData: string = '',
): Block {
  const previousBlock = getLatestBlock(blockChain);
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = ~~(Date.now() / 1000);
  const nextHash = calculateHash(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    blockData,
  );
  return {
    index: nextIndex,
    previousHash: previousBlock.hash,
    timestamp: nextTimestamp,
    data: blockData,
    hash: nextHash,
  };
}

export function isValidNewBlock(
  newBlock: Block,
  previousBlock: Block,
): boolean {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log('invalid index');
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log('invalid previousHash');
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.log(`invalid hash: ${calculateHashForBlock(newBlock)} ${newBlock.hash}`);
    return false;
  }
  return true;
}

export function isValidChain(blockChainToValidate: BlockChain): boolean {
  if (
    JSON.stringify(blockChainToValidate[0]) !==
    JSON.stringify(getGenesisBlock())
  ) {
    return false;
  }

  const tempBlocks = [blockChainToValidate[0]];
  for (let i = 1; i < blockChainToValidate.length; i++) {
    if (isValidNewBlock(blockChainToValidate[i], tempBlocks[i - 1])) {
      tempBlocks.push(blockChainToValidate[i]);
    } else {
      return false;
    }
  }
  return true;
}

export function addBlock(blockChain: BlockChain, newBlock: Block): BlockChain {
  if (isValidNewBlock(newBlock, getLatestBlock(blockChain))) {
    return blockChain.concat([newBlock]);
  }
  return blockChain;
}
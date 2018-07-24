import SHA256 from 'crypto-js/sha256';
import { CONVERSIONS, MINING } from './constant';
import { Block, Blockchain, Transfer } from './types';
import { getGenesisBlock } from './history';
import hexToBinary from 'hex-to-binary';

export function getLatestBlock(blockchain: Blockchain): Block {
  return blockchain[blockchain.length - 1];
}

export function calculateHashForBlock(block: Block): string {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce,
  );
}

function getDifficulty(blockchain: Blockchain): number {
  const latestBlock = getLatestBlock(blockchain);
  if (
    latestBlock.index % MINING.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, blockchain);
  } else {
    return latestBlock.difficulty;
  }
}

// マイニング難易度調整
function getAdjustedDifficulty(
  latestBlock: Block,
  blockchain: Blockchain,
): number {
  const prevAdjustmentBlock: Block =
    blockchain[blockchain.length - MINING.DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected =
    MINING.BLOCK_GENERATION_INTERVAL * MINING.DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  if (timeTaken < timeExpected / MINING.INTERVAL_RANGE) {
    return prevAdjustmentBlock.difficulty + MINING.DIFFICULTY_ADJUSTMENT_RATE;
  } else if (timeTaken > timeExpected * MINING.INTERVAL_RANGE) {
    return prevAdjustmentBlock.difficulty - MINING.DIFFICULTY_ADJUSTMENT_RATE;
  } else {
    return prevAdjustmentBlock.difficulty;
  }
}

function getCurrentTimestamp(): number {
  return Math.round(new Date().getTime() / CONVERSIONS.sec);
}

export function calculateHash(
  index: number,
  previousHash: string,
  timestamp: number,
  data: Transfer | {} = {},
  difficulty: number,
  nonce: number,
): string {
  return SHA256(
    index +
      previousHash +
      timestamp +
      JSON.stringify(data) +
      difficulty +
      nonce,
  ).toString();
}

// mining
function findBlock(
  index: number,
  previousHash: string,
  timestamp: number,
  data: Transfer | {},
  difficulty: number,
): Block {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
      nonce,
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return {
        index,
        previousHash,
        timestamp,
        data,
        hash,
        difficulty,
        nonce,
      };
    }
    nonce++;
  }
}

export function generateNextBlock(
  blockchain: Blockchain,
  blockData: Transfer | {},
): Block {
  const previousBlock = getLatestBlock(blockchain);
  const difficulty = getDifficulty(blockchain);
  console.log('difficulty: ' + difficulty);
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = getCurrentTimestamp();
  return findBlock(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    blockData,
    difficulty,
  );
}

export function isValidBlockStructure(block: Block): boolean {
  return (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number'
  );
}

function isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
  const min = CONVERSIONS.min / CONVERSIONS.sec;
  return (
    previousBlock.timestamp - min < newBlock.timestamp &&
    newBlock.timestamp - min < getCurrentTimestamp()
  );
}

function hashMatchesBlockContent(block: Block): boolean {
  const blockHash = calculateHashForBlock(block);
  return blockHash === block.hash;
}

function hashMatchesDifficulty(hash: string, difficulty: number): boolean {
  const hashInBinary = hexToBinary(hash);
  const requiredPrefix = '0'.repeat(difficulty);
  return hashInBinary.startsWith(requiredPrefix);
}

function hasValidHash(block: Block): boolean {
  if (!hashMatchesBlockContent(block)) {
    console.log(`invalid hash, got: ${block.hash}`);
    return false;
  }

  if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
    console.log(
      `block difficulty not satisfied. Expected: ${block.difficulty} got: ${
        block.hash
      }`,
    );
  }
  return true;
}

export function isValidNewBlock(
  newBlock: Block,
  previousBlock: Block,
): boolean {
  if (!isValidBlockStructure(newBlock)) {
    console.log('invalid structure');
    return false;
  }
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log('invalid index');
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log('invalid previousHash');
    return false;
  } else if (!isValidTimestamp(newBlock, previousBlock)) {
    console.log('invalid timestamp');
    return false;
  } else if (!hasValidHash(newBlock)) {
    console.log('invalid hash');
    return false;
  }
  return true;
}

export function isValidChain(blockchainToValidate: Blockchain): boolean {
  const isValidGenesis = (block: Block): boolean => {
    return JSON.stringify(block) === JSON.stringify(getGenesisBlock());
  };

  if (!isValidGenesis(blockchainToValidate[0])) {
    return false;
  }

  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (
      !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])
    ) {
      return false;
    }
  }
  return true;
}

export function addBlock(blockchain: Blockchain, newBlock: Block) {
  if (isValidNewBlock(newBlock, getLatestBlock(blockchain))) {
    blockchain.push(newBlock);
  }
}

export function getAccumulatedDifficulty(blockchain: Blockchain): number {
  return blockchain
    .map((block: Block) => block.difficulty)
    .map((difficulty: number) => Math.pow(2, difficulty)) // tslint:disable-line:no-magic-numbers
    .reduce((a: number, b: number) => a + b);
}

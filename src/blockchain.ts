import SHA256 from 'crypto-js/sha256';
import WebSocket from 'ws';
import { MessageType, Conversions } from './constant';
import { p2pPort } from './config';
import { getBlockchain } from './history';

interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: string;
  hash: string;
}

const sockets = [];

export type Blockchain = Block[];

interface BlockMessage {
  type: number;
  data: string;
}

export function getGenesisBlock(): Block {
  return createBlock(
    0,
    '0',
    1465154705, // tslint:disable-line:no-magic-numbers
    'my genesis block!!',
    '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
  );
}

export function getLatestBlock(blockchain: Blockchain): Block {
  return blockchain[blockchain.length - 1];
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

export function calculateHashForBlock(block: Block): string {
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
  blockchain: Blockchain,
  blockData: string = '',
): Block {
  const previousBlock = getLatestBlock(blockchain);
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = ~~(Date.now() / Conversions.sec);
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
    console.log(
      `invalid hash: ${calculateHashForBlock(newBlock)} ${newBlock.hash}`,
    );
    return false;
  }
  return true;
}

export function isValidChain(blockchainToValidate: Blockchain): boolean {
  if (
    JSON.stringify(blockchainToValidate[0]) !==
    JSON.stringify(getGenesisBlock())
  ) {
    return false;
  }

  const tempBlocks = [blockchainToValidate[0]];
  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
      tempBlocks.push(blockchainToValidate[i]);
    } else {
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

export function responseLatestMsg(blockchain: Blockchain): BlockMessage {
  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock(blockchain)]),
  };
}

function responseChainMsg(blockchain: Blockchain): BlockMessage {
  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(blockchain),
  };
}

function queryAllMsg(): {
  type: number;
} {
  return {
    type: MessageType.QUERY_ALL,
  };
}

function queryChainLengthMsg(): {
  type: number;
} {
  return {
    type: MessageType.QUERY_LATEST,
  };
}

function replaceChain(newBlocks: Blockchain, blockchain: Blockchain): void {
  if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
    console.log(
      'Received blockchain is valid. Replacing current blockchain with received blockchain',
    );
    broadcast(responseLatestMsg(newBlocks));
  } else {
    console.log('Received blockchain invalid');
  }
}

function handleBlockchainResponse(
  message: BlockMessage,
  blockchain: Blockchain,
): void {
  const receivedBlocks = JSON.parse(message.data).sort(
    (b1: Block, b2: Block) => b1.index - b2.index,
  );
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  const latestBlockHeld = getLatestBlock(blockchain);
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      'blockchain possibly behind. We got: ' +
        latestBlockHeld.index +
        ' Peer got: ' +
        latestBlockReceived.index,
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.log('We can append the received block to our chain');
      blockchain.push(latestBlockReceived);
      broadcast(responseLatestMsg(blockchain));
    } else if (receivedBlocks.length === 1) {
      console.log('We have to query the chain from our peer');
      broadcast(queryAllMsg());
    } else {
      console.log('Received blockchain is longer than current blockchain');
      replaceChain(receivedBlocks, blockchain);
    }
  } else {
    console.log(
      'received blockchain is not longer than current blockchain. Do nothing',
    );
  }
}

function write(
  ws: WebSocket,
  message:
    | BlockMessage
    | {
        type: number;
      },
): void {
  ws.send(JSON.stringify(message));
}

export function broadcast(
  message:
    | BlockMessage
    | {
        type: number;
      },
) {
  sockets.forEach((socket: WebSocket) => {
    write(socket, message);
  });
}

function initMessageHandler(ws: WebSocket, blockchain: Blockchain): void {
  ws.on('message', (data: string) => {
    const message = JSON.parse(data);
    console.log('Received message' + JSON.stringify(message));
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        write(ws, responseLatestMsg(blockchain));
        break;
      case MessageType.QUERY_ALL:
        write(ws, responseChainMsg(blockchain));
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        handleBlockchainResponse(message, blockchain);
        break;
    }
  });
}

function initErrorHandler(ws: WebSocket): void {
  const closeConnection = (ws: WebSocket) => {
    console.log('connection failed to peer: ' + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on('close', () => closeConnection(ws));
  ws.on('error', () => closeConnection(ws));
}

function initConnection(ws: WebSocket, blockchain: Blockchain): void {
  sockets.push(ws);
  initMessageHandler(ws, blockchain);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
}

export function getPeers(): string[] {
  return sockets.map((socket: any) => {
    return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
  });
}

export function connectToPeers(
  newPeers: string[],
  blockchain: Blockchain,
): void {
  newPeers.forEach((peer: string) => {
    const ws = new WebSocket(peer);
    ws.on('open', () => {
      initConnection(ws, blockchain);
    });
    ws.on('error', () => {
      console.log('connection failed');
    });
  });
}

export function initP2PServer(blockchain: Blockchain) {
  const server = new WebSocket.Server({ port: +p2pPort });
  server.on('connection', (ws: WebSocket) => {
    initConnection(ws, blockchain);
    console.log('listening websocket p2p port on: ' + p2pPort);
  });
}

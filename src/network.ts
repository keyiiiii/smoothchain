import WebSocket from 'ws';
import { getLatestBlock, isValidChain, responseLatestMsg } from './blockchain';
import { p2pPort } from './config';
import { MessageType } from './constant';
import { Block, Blockchain, BlockMessage } from './types';

const sockets = [];

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

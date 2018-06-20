import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  getGenesisBlock,
  generateNextBlock,
  addBlock,
  isValidChain,
  responseLatestMsg,
  broadcast,
  getPeers,
  connectToPeers,
  initP2PServer,
} from './blockChain';
import { httpPort, initialPeers } from './config';

const app = express();

app.use(bodyParser.json());

// initialize blockchain
let blockChain = [getGenesisBlock()];

app.get('/add/:data', (req: Request, res: Response) => {
  const { data } = req.params;
  const next = generateNextBlock(blockChain, data);
  const newBlockchain = addBlock(blockChain, next);
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  // TODO: save DB
  blockChain = newBlockchain;
  res.json(newBlockchain);
});

app.get('/chain', (_, res: Response) => {
  res.json(blockChain);
});

app.get('/peers', (_, res: Response) => {
  res.send(getPeers());
});

app.post('/addPeer', (req: Request, res: Response) => {
  connectToPeers([req.body.peer], blockChain);
  res.send();
});

app.listen(httpPort, () => {
  console.log('port 3000');
  connectToPeers(initialPeers, blockChain);
  initP2PServer(blockChain);
});

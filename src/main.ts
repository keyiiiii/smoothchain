import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  generateNextBlock,
  addBlock,
  isValidChain,
  responseLatestMsg,
  broadcast,
  getPeers,
  connectToPeers,
  initP2PServer,
} from './blockchain';
import { httpPort, initialPeers } from './config';
import { getBlockchain } from './history';

const app = express();

app.use(bodyParser.json());

app.get('/add/:data', (req: Request, res: Response) => {
  const { data } = req.params;
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next)
  const newBlockchain = getBlockchain();
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.json(newBlockchain);
});

app.get('/chain', (_, res: Response) => {
  res.json(getBlockchain());
});

app.get('/peers', (_, res: Response) => {
  res.send(getPeers());
});

app.post('/addPeer', (req: Request, res: Response) => {
  connectToPeers([req.body.peer], getBlockchain());
  res.send();
});

app.listen(httpPort, () => {
  console.log('port 3000');
  connectToPeers(initialPeers, getBlockchain());
  initP2PServer(getBlockchain());
});

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { generateNextBlock, addBlock, isValidChain } from './blockchain';
import {
  broadcast,
  getPeers,
  connectToPeers,
  initP2PServer,
  responseLatestMsg,
} from './network';
import { httpPort, initialPeers } from './config';
import { getBlockchain } from './history';
import { transferValue } from './state/account';

const app = express();

app.use(bodyParser.json());

// FIXME: deprecated
app.get('/add/:data', (req: Request, res: Response) => {
  const { data } = req.params;
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next);
  const newBlockchain = getBlockchain();
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.json(newBlockchain);
});

app.post('/transaction', (req: Request, res: Response) => {
  const { from, to, value } = req.body;
  // 送金
  transferValue(from, to, value);

  const data = {
    transfer: { from, to, value },
  };
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next);
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

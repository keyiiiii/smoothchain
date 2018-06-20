import express from 'express';
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
import {
  http_port,
  initialPeers,
} from './config';

const app = express();

app.use(bodyParser.json());

// initialize blockchain
let blockChain = [getGenesisBlock()];

app.get('/add/:data', (req, res) => {
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

app.get('/chain', (_, res) => {
  res.json(blockChain);
});

app.get('/peers', (_, res) => {
  res.send(getPeers());
});

app.post('/addPeer', (req, res) => {
	console.log('req.body', req.body);
	connectToPeers([req.body.peer], blockChain);
	res.send();
});

app.listen(http_port, () => {
  console.log('port 3000');
  connectToPeers(initialPeers, blockChain);
  initP2PServer(blockChain);
});
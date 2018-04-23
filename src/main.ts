import express from 'express';
import {
  getGenesisBlock,
  generateNextBlock,
  addBlock,
  isValidChain,
} from './blockChain';

const app = express();

// initialize blockchain
let blockChain = [getGenesisBlock()];

app.get('/add/:data', (req, res) => {
  const { data } = req.params;
  const next = generateNextBlock(blockChain, data);
  const newBlockchain = addBlock(blockChain, next);
  blockChain = newBlockchain;

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.json(newBlockchain);
});

app.get('/chain', (_, res) => {
  res.json(blockChain);
});

app.listen(3000, () => {
   console.log('port 3000');
});
import express from 'express';
import {
  getGenesisBlock,
  generateNextBlock,
  getLatestBlock,
  addBlock,
  isValidChain,
} from './blockChain';

const app = express();

// initialize blockchain
let blockChain = [getGenesisBlock()];

app.get('/add/:data', (req, res) => {
  console.warn(req.params);
  const { data } = req.params;
  // const prev = getLatestBlock(blockChain);
  const next = generateNextBlock(blockChain, data);
  const newBlockchain = addBlock(blockChain, next);
  blockChain = newBlockchain;

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.send('test');
});

app.listen(3000, () => {
   console.log('port 3000');
});
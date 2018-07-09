/**
 * FIXME: replace jwt
 */

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import SHA256 from 'crypto-js/sha256';
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
import {
  transferValue,
  getValue,
  getAccounts,
  getAccountAssets,
  postAccount,
} from './state/account';
import { putAssets, getAssets } from './state/assets';
import { CONVERSIONS, STATUS_CODE } from './constant';

const app = express();

app.use(bodyParser.json());

// CORSを許可する
app.use(function(_, res: Response, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// TODO: route テキトーなのできれいにする

/**
 * アカウント発行
 * 重複考えてないしテキトー実装なのでマジで直す
 */
app.post('/api/account', (req: Request, res: Response) => {
  const { seed } = req.body;
  console.log('seed', seed);
  res.json({
    address: SHA256(seed).toString(),
  });
});

/**
 * トランザクション作成
 */
app.post('/api/transaction', (req: Request, res: Response) => {
  const { from, to, seed, assetId } = req.body;
  const value = parseInt(req.body.value, 10);

  if (from === to) {
    // TODO: エラーコード
    res.send();
    return;
  }

  if (SHA256(seed).toString() !== from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }
  // 送金
  transferValue({ from, to, value, assetId });

  const data = {
    transfer: { from, to, value },
  };
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next);
  const newBlockchain = getBlockchain();
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.json(next);
});

/**
 * token作成
 */
app.post('/api/assets/issue', (req: Request, res: Response) => {
  const { from, seed, name, description } = req.body;
  const total = parseInt(req.body.total, 10) || 0;
  const decimals = parseInt(req.body.decimals, 10) || 0;

  if (SHA256(seed).toString() !== from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }
  const timestamp = ~~(Date.now() / CONVERSIONS.sec);
  const id = SHA256(seed + name + timestamp).toString();

  putAssets({ id, name, description, total, decimals });
  postAccount({ address: from, value: total }, id);

  const data = {
    assets: { id, from, name, description, total, decimals },
  };
  // TODO: block生成共通化
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next);
  const newBlockchain = getBlockchain();
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  res.json(next);
});

/**
 * アカウントリスト
 */
app.get('/api/account/list', (_, res: Response) => {
  res.json(getAccounts());
});

/**
 * トークンリスト
 */
app.get('/api/assets/list', (_, res: Response) => {
  res.json(getAssets());
});

/**
 * ユーザーに紐づくトークンリスト
 */
app.get('/api/assets/list/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  res.json(getAccountAssets(address));
});

/**
 * ブロックチェーンをみる
 */
app.get('/api/chain', (_, res: Response) => {
  res.json(getBlockchain());
});

/**
 * 自分の保有量を確認
 */
app.get('/api/balance/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  const { assetId } = req.query;
  res.json({
    balance: getValue(address, assetId),
  });
});

/**
 * 接続済みのノードを確認
 */
app.get('/api/peers', (_, res: Response) => {
  res.send(getPeers());
});

/**
 * ノード接続
 */
app.post('/api/addPeer', (req: Request, res: Response) => {
  connectToPeers([req.body.peer], getBlockchain());
  res.send();
});

app.listen(httpPort, () => {
  console.log('port', httpPort);
  connectToPeers(initialPeers, getBlockchain());
  initP2PServer(getBlockchain());
});

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
import { putAssets, getAssets, getAsset } from './state/assets';
import {
  CONVERSIONS,
  NATIVE_TOKEN,
  STATUS_CODE,
  LEVY_RATE,
  CASHBACK_RATE,
} from './constant';
import { Block } from './types';

function generateBlock(data: any): Block {
  const next = generateNextBlock(getBlockchain(), data);
  addBlock(getBlockchain(), next);
  const newBlockchain = getBlockchain();
  broadcast(responseLatestMsg(newBlockchain));

  console.log('isValidChain', isValidChain(newBlockchain));
  console.log('newBlockchain', newBlockchain);
  return next;
}

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
  const { from, to, seed, message } = req.body;
  const value = parseInt(req.body.value, 10);
  const assetId = req.body.assetId || NATIVE_TOKEN.ID;

  // 送信元と送信先が一緒なら弾く
  if (from === to) {
    res.status(STATUS_CODE.BAD_REQUEST).send();
    return;
  }

  // seed とアドレスが一致しない場合は弾く
  if (SHA256(seed).toString() !== from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }

  // transferable じゃない asset は from か to が asset.from に一致する必要がある
  const asset = getAsset(assetId);
  if (
    !asset.optional.transferable &&
    !(asset.from === from || asset.from === to)
  ) {
    res.status(STATUS_CODE.METHOD_NOT_ALLOWED).send();
    return;
  }

  // 送金
  if (asset.optional.levy) {
    const levyValue = Math.floor(value * LEVY_RATE);
    // 徴収分
    transferValue({ from, to: asset.from, value: levyValue, assetId });

    const levyData = {
      transfer: { from, to: asset.from, value: levyValue, assetId },
    };
    const levyBlock = generateBlock(levyData);

    // 通常分
    transferValue({ from, to, value: value - levyValue, assetId });

    const data = {
      transfer: { from, to, value: value - levyValue, assetId, message },
    };
    const block = generateBlock(data);

    res.json([levyBlock, block]);
  } else if (asset.optional.cashback) {
    const cashbackValue = Math.floor(value * CASHBACK_RATE);
    // 通常分
    transferValue({ from, to, value, assetId });

    const data = {
      transfer: { from, to, value, assetId, message },
    };
    const block = generateBlock(data);

    // 送金者とトークン発行者が同じ場合はキャッシュバックを無視する
    if (asset.from !== from) {
      // キャッシュバック分
      transferValue({
        from: asset.from,
        to: from,
        value: cashbackValue,
        assetId,
      });

      const cashbackData = {
        transfer: { from: asset.from, to: from, value: cashbackValue, assetId },
      };
      const cashbackBlock = generateBlock(cashbackData);

      res.json([cashbackBlock, block]);
    } else {
      res.json(block);
    }
  } else {
    transferValue({ from, to, value, assetId });

    const data = {
      transfer: { from, to, value, assetId, message },
    };
    res.json(generateBlock(data));
  }
});

/**
 * token作成
 */
app.post('/api/assets/issue', (req: Request, res: Response) => {
  const { from, seed, name, description, optional } = req.body;
  const total = parseInt(req.body.total, 10) || 0;
  const decimals = parseInt(req.body.decimals, 10) || 0;

  // seed とアドレスが一致しない場合は弾く
  if (SHA256(seed).toString() !== from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }

  const timestamp = ~~(Date.now() / CONVERSIONS.sec);
  const id = SHA256(seed + name + timestamp).toString();

  putAssets({ from, id, name, description, total, decimals, optional });
  postAccount({ address: from, value: total }, id);

  const data = {
    assets: { id, from, name, description, total, decimals, optional },
  };
  res.json(generateBlock(data));
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
 * トークン詳細
 */
app.get('/api/assets/:assetId', (req: Request, res: Response) => {
  const { assetId } = req.params;
  res.json(getAsset(assetId));
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
  const assetId = req.query.assetId || NATIVE_TOKEN.ID;
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

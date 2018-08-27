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
import { getValue, getAccounts, getAccountAssets } from './state/account';
import { getAssets, getAsset } from './state/assets';
import { NATIVE_TOKEN, STATUS_CODE } from './constant';
import { Block, BlockData } from './types';
import {
  getAgreementEscrow,
  deleteEscrow,
  getEscrows,
  putEscrows,
  getEscrowsFrom,
  getEscrowEscrowId,
} from './state/escrow';
import { swapTransfer, transfer } from './transaction/transfer';
import { assetsIssue } from './transaction/asset';

// TODO: move
export function generateBlock(data: BlockData): Block {
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

  try {
    const result = transfer({
      from,
      to,
      seed,
      message,
      assetId,
      value,
    });
    res.json(result);
  } catch (e) {
    res.status(STATUS_CODE[e.message]).send();
  }
});

app.post('/api/transaction/revert', (req: Request, res: Response) => {
  const { owner, index } = req.body;
  const targetBlock = getBlockchain().find(
    (block: Block) => block.index === parseInt(index, 10),
  );

  try {
    const {
      data: {
        transfer: { from, to, message, assetId, value },
      },
    } = targetBlock;
    const result = transfer(
      {
        from: to,
        to: from,
        seed: '',
        message,
        assetId,
        value,
      },
      owner,
    );
    res.json(result);
  } catch (e) {
    res.status(STATUS_CODE[e.message]).send();
  }
});

/**
 * token作成
 */
app.post('/api/assets/issue', (req: Request, res: Response) => {
  const {
    from,
    seed,
    name,
    description,
    optional,
    children,
    total,
    decimals,
  } = req.body;

  try {
    const result = assetsIssue({
      from,
      seed,
      name,
      description,
      optional,
      total,
      decimals,
      children,
    });
    res.json(result);
  } catch (e) {
    res.status(STATUS_CODE[e.message]).send();
  }
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
 * swap
 */
app.get('/api/swap/list', (_, res: Response) => {
  res.json(getEscrows());
});

// from に紐付いた Escrows を返す
app.get('/api/swap/list/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  res.json(getEscrowsFrom(address));
});

app.post('/api/swap/order', (req: Request, res: Response) => {
  const { from, seed } = req.body;
  const sell = {
    assetId: req.body.sell.assetId,
    value: parseInt(req.body.sell.value, 10),
  };
  const buy = {
    assetId: req.body.buy.assetId,
    value: parseInt(req.body.buy.value, 10),
  };
  if (!(sell.assetId && sell.value && buy.assetId && buy.value)) {
    res.status(STATUS_CODE.BAD_REQUEST).send();
  }

  let transactionResult: Object;
  // escrow address に送金
  try {
    transactionResult = transfer({
      from,
      to: `esc${from}`,
      seed,
      message: '',
      assetId: sell.assetId,
      value: sell.value,
    });
  } catch (e) {
    res.status(STATUS_CODE[e.message]).send();
  }
  // 売りと買いが一致する escrow を探す
  const agreementEscrows = getAgreementEscrow(sell, buy);
  // 一致しなかった場合は put する
  if (
    !agreementEscrows ||
    (agreementEscrows.sell.value < buy.value &&
      agreementEscrows.buy.value > sell.value)
  ) {
    putEscrows({ from, seed, sell, buy });
    res.json(transactionResult);
  } else {
    try {
      // escrow が一致した場合 transaction をつくる
      const swapResult = swapTransfer({
        sellTransaction: {
          from: `esc${from}`,
          to: agreementEscrows.from,
          assetId: agreementEscrows.buy.assetId,
          value: agreementEscrows.buy.value,
        },
        buyTransaction: {
          from: `esc${agreementEscrows.from}`,
          to: from,
          assetId: agreementEscrows.sell.assetId,
          value: agreementEscrows.sell.value,
        },
      });

      deleteEscrow(agreementEscrows.escrowId, agreementEscrows.from);

      res.json(swapResult);
    } catch (e) {
      putEscrows({ from, seed, sell, buy });
      // swap 失敗したときは transactionResult だけ返す
      res.json(transactionResult);
    }
  }
});

// escrow state の取り消し
// TODO: delete にしたい。 seed を header に入れたい
app.post('/api/swap/:escrowId', (req: Request, res: Response) => {
  const { escrowId } = req.params;
  const { from, seed } = req.body; // seed とアドレスが一致しない場合は弾く
  if (SHA256(seed).toString() !== from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }
  // escrow state から from に asset を戻す
  const exsistEscrow = getEscrowEscrowId(escrowId);
  transfer({
    from: `esc${from}`,
    to: from,
    seed,
    message: '',
    assetId: exsistEscrow.sell.assetId,
    value: exsistEscrow.sell.value,
  });
  res.json(deleteEscrow(escrowId, from));
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

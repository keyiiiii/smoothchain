import SHA256 from 'crypto-js/sha256';
import { Response } from 'express';
import { CASHBACK_RATE, LEVY_RATE, STATUS_CODE } from './constant';
import { getAsset } from './state/assets';
import { transferValue } from './state/account';
import { generateBlock } from './main';

interface TransactionPayload {
  from: string;
  to: string;
  seed: string;
  message: string;
  assetId: string;
  value: number;
}

export function transaction(payload: TransactionPayload, res: Response): void {
  // 送信元と送信先が一緒なら弾く
  if (payload.from === payload.to) {
    res.status(STATUS_CODE.BAD_REQUEST).send();
    return;
  }

  // seed とアドレスが一致しない場合は弾く
  if (SHA256(payload.seed).toString() !== payload.from) {
    res.status(STATUS_CODE.UNAUTHORIZED).send();
    return;
  }

  // transferable じゃない asset は from か to が asset.from に一致する必要がある
  const asset = getAsset(payload.assetId);
  if (
    !asset.optional.transferable &&
    !(asset.from === payload.from || asset.from === payload.to)
  ) {
    res.status(STATUS_CODE.METHOD_NOT_ALLOWED).send();
    return;
  }

  // 送金
  if (asset.optional.levy) {
    const levyValue = Math.floor(payload.value * LEVY_RATE);
    // 徴収分
    transferValue({
      from: payload.from,
      to: asset.from,
      value: levyValue,
      assetId: payload.assetId,
    });

    const levyData = {
      transfer: {
        from: payload.from,
        to: asset.from,
        value: levyValue,
        assetId: payload.assetId,
      },
    };
    const levyBlock = generateBlock(levyData);

    // 通常分
    transferValue({
      from: payload.from,
      to: payload.to,
      value: payload.value - levyValue,
      assetId: payload.assetId,
    });

    const data = {
      transfer: {
        from: payload.from,
        to: payload.to,
        value: payload.value - levyValue,
        assetId: payload.assetId,
        message: payload.message,
      },
    };
    const block = generateBlock(data);

    res.json([levyBlock, block]);
  } else if (asset.optional.cashback) {
    const cashbackValue = Math.floor(payload.value * CASHBACK_RATE);
    // 通常分
    transferValue({
      from: payload.from,
      to: payload.to,
      value: payload.value,
      assetId: payload.assetId,
    });

    const data = {
      transfer: {
        from: payload.from,
        to: payload.to,
        value: payload.value,
        assetId: payload.assetId,
        message: payload.message,
      },
    };
    const block = generateBlock(data);

    // 送金者とトークン発行者が同じ場合はキャッシュバックを無視する
    if (asset.from !== payload.from) {
      // キャッシュバック分
      transferValue({
        from: asset.from,
        to: payload.from,
        value: cashbackValue,
        assetId: payload.assetId,
      });

      const cashbackData = {
        transfer: {
          from: asset.from,
          to: payload.from,
          value: cashbackValue,
          assetId: payload.assetId,
        },
      };
      const cashbackBlock = generateBlock(cashbackData);

      res.json([cashbackBlock, block]);
    } else {
      res.json(block);
    }
  } else {
    transferValue({
      from: payload.from,
      to: payload.to,
      value: payload.value,
      assetId: payload.assetId,
    });

    const data = {
      transfer: {
        from: payload.from,
        to: payload.to,
        value: payload.value,
        assetId: payload.assetId,
        message: payload.message,
      },
    };
    res.json(generateBlock(data));
  }
}

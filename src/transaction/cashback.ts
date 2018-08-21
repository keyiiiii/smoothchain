import { transferValue } from '../state/account';
import { generateBlock } from '../main';
import { CASHBACK_RATE } from '../constant';
import { Asset } from '../state/assets';
import { TransactionPayload } from './transfer';

export function cashbackTransfer(
  payload: TransactionPayload,
  asset: Asset,
): Object {
  const value = Math.floor(payload.value * CASHBACK_RATE);
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
      value,
      assetId: payload.assetId,
    });

    const cashbackData = {
      transfer: {
        from: asset.from,
        to: payload.from,
        value,
        assetId: payload.assetId,
      },
    };
    const cashbackBlock = generateBlock(cashbackData);

    return [cashbackBlock, block];
  } else {
    return block;
  }
}

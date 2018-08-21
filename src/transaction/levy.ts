import { transferValue } from '../state/account';
import { generateBlock } from '../main';
import { LEVY_RATE } from '../constant';
import { TransactionPayload } from './transfer';
import { Asset } from '../state/assets';

export function levyTransfer(
  payload: TransactionPayload,
  asset: Asset,
): Object {
  const value = Math.floor(payload.value * LEVY_RATE);
  // 徴収分
  transferValue({
    from: payload.from,
    to: asset.from,
    value,
    assetId: payload.assetId,
  });

  const levyData = {
    transfer: {
      from: payload.from,
      to: asset.from,
      value,
      assetId: payload.assetId,
    },
  };
  const levyBlock = generateBlock(levyData);

  // 通常分
  transferValue({
    from: payload.from,
    to: payload.to,
    value: payload.value - value,
    assetId: payload.assetId,
  });

  const data = {
    transfer: {
      from: payload.from,
      to: payload.to,
      value: payload.value - value,
      assetId: payload.assetId,
      message: payload.message,
    },
  };
  const block = generateBlock(data);

  return [levyBlock, block];
}

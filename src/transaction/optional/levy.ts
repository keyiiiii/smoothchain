import { transferValue } from '../../state/account';
import { generateBlock } from '../../main';
import { LEVY_RATE } from '../../constant';
import { TransactionPayload } from '../transfer';
import { Asset } from '../../state/assets';

export function levyTransfer(
  payload: TransactionPayload,
  asset: Asset,
): Object {
  if (payload.assetId !== asset.id) {
    return false;
  }
  const value = Math.floor(payload.value * LEVY_RATE);
  // 送金者とトークン発行者が同じ場合は徴収を無視する
  if (asset.from !== payload.from) {
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
        message: '',
      },
    };
    const levyBlock = generateBlock(levyData);

    return [block, levyBlock];
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
    return generateBlock(data);
  }
}

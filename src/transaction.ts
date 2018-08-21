import SHA256 from 'crypto-js/sha256';
import { CASHBACK_RATE, LEVY_RATE, NATIVE_TOKEN } from './constant';
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

interface SwapPayload {
  from: string;
  to: string;
  assetId: string;
  value: number;
}

interface SwapTransactionPayload {
  sellTransaction: SwapPayload;
  buyTransaction: SwapPayload;
}

interface OwnerPayload {
  address: string;
  seed: string;
}

// TODO: security validation
export function swapTransaction(payload: SwapTransactionPayload): Object {
  const buyTransfer = {
    from: payload.buyTransaction.from,
    to: payload.buyTransaction.to,
    value: payload.buyTransaction.value,
    assetId: payload.buyTransaction.assetId,
  };
  transferValue(buyTransfer);

  const buyData = {
    transfer: { ...buyTransfer, message: '' },
  };

  const sellTransfer = {
    from: payload.sellTransaction.from,
    to: payload.sellTransaction.to,
    value: payload.sellTransaction.value,
    assetId: payload.sellTransaction.assetId,
  };
  transferValue(sellTransfer);

  const sellData = {
    transfer: { ...sellTransfer, message: '' },
  };

  return generateBlock([sellData, buyData]);
}

export function transaction(
  payload: TransactionPayload,
  owner?: OwnerPayload,
): Object {
  // 送信元と送信先が一緒なら弾く
  if (payload.from === payload.to) {
    throw new Error('BAD_REQUEST');
  }

  // seed とアドレスが一致しない場合は弾く
  // もしくは owner 権限持ってない場合は弾く ※owner は revert のみ有効
  const isAuthorize =
    SHA256(payload.seed).toString() === payload.from.replace(/^esc/, '');
  const isOwner =
    owner &&
    owner.address === NATIVE_TOKEN.FROM &&
    SHA256(owner.seed).toString() === owner.address;
  if (!(isAuthorize || (owner && isOwner))) {
    throw new Error('UNAUTHORIZED');
  }

  // transferable じゃない asset は from か to が asset.from に一致する必要がある
  const asset = getAsset(payload.assetId);
  if (
    !asset.optional.transferable &&
    !(asset.from === payload.from || asset.from === payload.to)
  ) {
    throw new Error('METHOD_NOT_ALLOWED');
  }

  // 送金
  if (asset.optional.levy && !payload.from.startsWith('esc')) {
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

    return [levyBlock, block];
  } else if (asset.optional.cashback && !payload.from.startsWith('esc')) {
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

      return [cashbackBlock, block];
    } else {
      return block;
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
    return generateBlock(data);
  }
}

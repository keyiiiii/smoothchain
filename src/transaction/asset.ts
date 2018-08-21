import SHA256 from 'crypto-js/sha256';
import { CONVERSIONS } from '../constant';
import { putAssets, Optional } from '../state/assets';
import { postAccount } from '../state/account';
import { generateBlock } from '../main';
import { Block } from '../types';

interface AssetsIssuePayload {
  from: string;
  seed: string;
  name: string;
  description: string;
  optional: Optional;
  total: number;
  decimals: number;
}

export function assetsIssue(payload: AssetsIssuePayload): Block {
  // seed とアドレスが一致しない場合は弾く
  if (SHA256(payload.seed).toString() !== payload.from) {
    throw new Error('UNAUTHORIZED');
  }

  const timestamp = ~~(Date.now() / CONVERSIONS.sec);
  const id = SHA256(payload.seed + payload.name + timestamp).toString();

  putAssets({
    from: payload.from,
    id,
    name: payload.name,
    description: payload.description,
    total: payload.total,
    decimals: payload.decimals,
    optional: payload.optional,
  });
  postAccount({ address: payload.from, value: payload.total }, id);

  const data = {
    assets: {
      id,
      from: payload.from,
      name: payload.name,
      description: payload.description,
      total: payload.total,
      decimals: payload.decimals,
      optional: payload.optional,
    },
  };

  return generateBlock(data);
}

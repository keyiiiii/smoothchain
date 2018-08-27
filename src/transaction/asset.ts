import SHA256 from 'crypto-js/sha256';
import { CONVERSIONS } from '../constant';
import { putAssets, Optional } from '../state/assets';
import { postAccount } from '../state/account';
import { generateBlock } from '../main';
import { Block } from '../types';

interface ChildAssetIssuePayload extends AssetsIssuePayload {
  meta?: string;
}

interface AssetsIssuePayload {
  from: string;
  seed?: string;
  name: string;
  description: string;
  optional: Optional;
  total?: string;
  decimals?: string;
  children?: ChildAssetIssuePayload[];
}

export function assetsIssue(payload: AssetsIssuePayload): Block {
  // seed とアドレスが一致しない場合は弾く
  if (SHA256(payload.seed).toString() !== payload.from) {
    throw new Error('UNAUTHORIZED');
  }

  const timestamp = ~~(Date.now() / CONVERSIONS.sec);
  const id = SHA256(payload.seed + payload.name + timestamp).toString();
  const total = parseInt(payload.total, 10) || 0;
  const decimals = parseInt(payload.decimals, 10) || 0;

  const children = [];
  if (payload.children && payload.children.length > 0) {
    payload.children.forEach((child: ChildAssetIssuePayload) => {
      const childTotal = parseInt(child.total, 10) || 0;
      const childDecimals = parseInt(child.decimals, 10) || 0;
      const childId = SHA256(
        payload.seed + payload.name + child.name + timestamp,
      ).toString();
      children.push({
        from: child.from,
        id: childId,
        name: child.name,
        description: child.description,
        total: childTotal,
        decimals: childDecimals,
        optional: child.optional,
        children: child.children || [],
        meta: child.meta,
      });

      postAccount({ address: child.from, value: childTotal }, childId);
    });
  } else {
    postAccount({ address: payload.from, value: total }, id);
  }

  putAssets({
    from: payload.from,
    id,
    name: payload.name,
    description: payload.description,
    total,
    decimals,
    optional: payload.optional,
    children,
  });

  const data = {
    assets: {
      id,
      from: payload.from,
      name: payload.name,
      description: payload.description,
      total,
      decimals,
      optional: payload.optional,
      children,
    },
  };

  return generateBlock(data);
}

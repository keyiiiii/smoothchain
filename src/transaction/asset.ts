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
  total?: number;
  decimals?: number;
  children?: ChildAssetIssuePayload[];
}

export function assetsIssue(payload: AssetsIssuePayload): Block {
  // seed とアドレスが一致しない場合は弾く
  if (SHA256(payload.seed).toString() !== payload.from) {
    throw new Error('UNAUTHORIZED');
  }

  const timestamp = ~~(Date.now() / CONVERSIONS.sec);
  const id = SHA256(payload.seed + payload.name + timestamp).toString();

  const children = [];
  if (payload.children && payload.children.length > 0) {
    payload.children.forEach((child: ChildAssetIssuePayload) => {
      const childId = SHA256(
        payload.seed + payload.name + child.name + timestamp,
      ).toString();
      children.push({
        from: child.from,
        id: childId,
        name: child.name,
        description: child.description,
        total: child.total,
        decimals: child.decimals,
        optional: child.optional,
        children: child.children || [],
        meta: child.meta,
      });

      postAccount({ address: child.from, value: child.total }, childId);
    });
  } else {
    postAccount({ address: payload.from, value: payload.total }, id);
  }

  putAssets({
    from: payload.from,
    id,
    name: payload.name,
    description: payload.description,
    total: payload.total,
    decimals: payload.decimals,
    optional: payload.optional,
    children,
  });

  const data = {
    assets: {
      id,
      from: payload.from,
      name: payload.name,
      description: payload.description,
      total: payload.total,
      decimals: payload.decimals,
      optional: payload.optional,
      children,
    },
  };

  return generateBlock(data);
}

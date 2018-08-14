import SHA256 from 'crypto-js/sha256';
import { getCurrentTimestamp } from '../utils/date';

/**
 * Escrow State
 */

interface Asset {
  assetId: string;
  value: number;
}

interface EscrowPayload {
  from: string;
  seed: string;
  sell: Asset;
  buy: Asset;
}

export interface Escrow {
  escrowId: string;
  from: string;
  sell: Asset;
  buy: Asset;
  timestamp: string;
}

// TODO: immutable にする
// 初期値
export let escrows = [];

// Escrows の上書き
export function replaceEscrows(newEscrows: Escrow[]): void {
  escrows = newEscrows;
}

// すべての Escrows を返す
export function getEscrows(): Escrow[] {
  return [...escrows];
}

// from に紐付いた Escrows を返す
export function getEscrowsFrom(from: string): Escrow[] {
  return getEscrows().filter((escrow: Escrow) => {
    return escrow.from === from;
  });
}

// escrow を取り消す
export function deleteEscrow(escrowId: string, from: string): Escrow[] {
  const esc = [];
  getEscrows().forEach((escrow: Escrow) => {
    if (!(escrow.escrowId === escrowId && escrow.from === from)) {
      esc.push(escrow);
    }
  });
  replaceEscrows(esc);
  return getEscrows();
}

// 売りと買いが一致する escrow を取り出す
export function getAgreementEscrow(sell: Asset, buy: Asset): Escrow {
  return getEscrows().find((escrow: Escrow) => {
    return (
      escrow.buy.assetId === sell.assetId && escrow.sell.assetId === buy.assetId
    );
  });
}

// escrow を追加する
export function putEscrows(escrowPayload: EscrowPayload): void {
  const timestamp = getCurrentTimestamp();
  const escrowId = SHA256(
    escrowPayload.from +
      escrowPayload.seed +
      JSON.stringify(escrowPayload.sell) +
      JSON.stringify(escrowPayload.buy) +
      timestamp,
  ).toString();
  escrows.push({
    escrowId,
    from: escrowPayload.from,
    sell: escrowPayload.sell,
    buy: escrowPayload.buy,
    timestamp,
  });
}

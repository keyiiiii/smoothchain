export interface Transfer {
  from: string;
  to: string;
  value: number;
  assetId: string;
  message: string;
}

export interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: Transfer | {};
  hash: string;
  nonce: number;
  difficulty: number;
}

export type Blockchain = Block[];

export interface PeerMessage {
  type: number;
  data: string;
  accounts: string;
  assets: string;
  escrow: string;
}

export interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: string;
  hash: string;
}

export type Blockchain = Block[];

export interface BlockMessage {
  type: number;
  data: string;
}

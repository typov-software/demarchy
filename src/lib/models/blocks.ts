export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'asset';

export interface BlockProps {
  // These are not firestore ids as blocks are not a firestore collection
  uid: string;
  content: string;
  type: BlockType;
}

export type Block = BlockProps;

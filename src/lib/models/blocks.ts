export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'asset';

export interface BlockProps {
  // These are not firestore ids as blocks are not a collection on docs
  id: string;
  content: string;
  type: BlockType;

  link?: {
    href: string;
    title?: string;
  };
}

export type Block = BlockProps;

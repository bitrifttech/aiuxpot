export interface FileTreeNodeType {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNodeType[];
}

export interface FileTreeStructure {
  [key: string]: FileTreeNodeType;
}
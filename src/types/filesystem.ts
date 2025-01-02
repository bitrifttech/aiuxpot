export interface FileSystemNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileSystemNode[];
  parent?: string;
  metadata?: {
    size?: number;
    modified?: Date;
    created?: Date;
    extension?: string;
  };
}

export interface FileSystemState {
  root: FileSystemNode;
  expandedNodes: Set<string>;
  selectedNode?: string;
}

export type FileSystemAction =
  | { type: 'SET_ROOT'; payload: FileSystemNode }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'SELECT_NODE'; payload: string }
  | { type: 'ADD_NODE'; payload: { parentId: string; node: FileSystemNode } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'RENAME_NODE'; payload: { id: string; newName: string } }
  | { type: 'MOVE_NODE'; payload: { nodeId: string; newParentId: string } };

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { FileSystemNode, FileSystemState, FileSystemAction } from '@/types/filesystem';
import { fileSystemReducer } from '@/reducers/filesystem-reducer';
import { FileSystemService } from '@/lib/filesystem/filesystem-service';

interface FileSystemContextType {
  state: FileSystemState;
  dispatch: React.Dispatch<FileSystemAction>;
  isExpanded: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  toggleNode: (id: string) => void;
  selectNode: (id: string) => void;
  addNode: (parentId: string, node: FileSystemNode) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  moveNode: (nodeId: string, newParentId: string) => void;
  createFile: (parentId: string, name: string) => Promise<void>;
  createDirectory: (parentId: string, name: string) => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

const initialState: FileSystemState = {
  root: {
    id: 'root',
    name: 'Project Root',
    path: '/',
    type: 'directory',
    children: []
  },
  expandedNodes: new Set(['root']),
  selectedNode: undefined
};

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fileSystemReducer, initialState);
  const fileSystemService = FileSystemService.getInstance();

  useEffect(() => {
    const loadFileSystem = async () => {
      const root = await fileSystemService.loadFileSystem();
      dispatch({ type: 'SET_ROOT', payload: root });
    };

    loadFileSystem();
  }, []);

  const isExpanded = useCallback((id: string) => state.expandedNodes.has(id), [state.expandedNodes]);
  const isSelected = useCallback((id: string) => state.selectedNode === id, [state.selectedNode]);

  const toggleNode = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_NODE', payload: id });
  }, []);

  const selectNode = useCallback((id: string) => {
    dispatch({ type: 'SELECT_NODE', payload: id });
  }, []);

  const addNode = useCallback((parentId: string, node: FileSystemNode) => {
    dispatch({ type: 'ADD_NODE', payload: { parentId, node } });
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    const node = findNode(state.root, id);
    if (node) {
      await fileSystemService.deleteNode(node.path);
      dispatch({ type: 'DELETE_NODE', payload: id });
    }
  }, [state.root]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const node = findNode(state.root, id);
    if (node) {
      await fileSystemService.renameNode(node.path, newName);
      dispatch({ type: 'RENAME_NODE', payload: { id, newName } });
    }
  }, [state.root]);

  const moveNode = useCallback(async (nodeId: string, newParentId: string) => {
    const node = findNode(state.root, nodeId);
    const newParent = findNode(state.root, newParentId);
    if (node && newParent) {
      await fileSystemService.moveNode(node.path, newParent.path);
      dispatch({ type: 'MOVE_NODE', payload: { nodeId, newParentId } });
    }
  }, [state.root]);

  const createFile = useCallback(async (parentId: string, name: string) => {
    const parent = findNode(state.root, parentId);
    if (parent) {
      const newFile = await fileSystemService.createFile(parent.path, name);
      dispatch({ type: 'ADD_NODE', payload: { parentId, node: newFile } });
    }
  }, [state.root]);

  const createDirectory = useCallback(async (parentId: string, name: string) => {
    const parent = findNode(state.root, parentId);
    if (parent) {
      const newDir = await fileSystemService.createDirectory(parent.path, name);
      dispatch({ type: 'ADD_NODE', payload: { parentId, node: newDir } });
    }
  }, [state.root]);

  return (
    <FileSystemContext.Provider
      value={{
        state,
        dispatch,
        isExpanded,
        isSelected,
        toggleNode,
        selectNode,
        addNode,
        deleteNode,
        renameNode,
        moveNode,
        createFile,
        createDirectory
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

function findNode(root: FileSystemNode, id: string): FileSystemNode | undefined {
  if (root.id === id) return root;
  if (!root.children) return undefined;
  
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  
  return undefined;
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}

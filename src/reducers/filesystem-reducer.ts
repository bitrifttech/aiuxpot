import { FileSystemNode, FileSystemState, FileSystemAction } from '@/types/filesystem';

function findNode(root: FileSystemNode, id: string): FileSystemNode | undefined {
  if (root.id === id) return root;
  if (!root.children) return undefined;
  
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  
  return undefined;
}

function deleteNode(root: FileSystemNode, id: string): FileSystemNode {
  if (!root.children) return root;
  
  return {
    ...root,
    children: root.children
      .filter(child => child.id !== id)
      .map(child => deleteNode(child, id))
  };
}

function updateNode(root: FileSystemNode, id: string, updates: Partial<FileSystemNode>): FileSystemNode {
  if (root.id === id) {
    return { ...root, ...updates };
  }
  
  if (!root.children) return root;
  
  return {
    ...root,
    children: root.children.map(child => updateNode(child, id, updates))
  };
}

function moveNode(root: FileSystemNode, nodeId: string, newParentId: string): FileSystemNode {
  const nodeToMove = findNode(root, nodeId);
  if (!nodeToMove) return root;
  
  // Remove node from its current location
  const rootWithoutNode = deleteNode(root, nodeId);
  
  // Add node to new parent
  return updateNode(rootWithoutNode, newParentId, {
    children: [
      ...(findNode(rootWithoutNode, newParentId)?.children || []),
      { ...nodeToMove, parent: newParentId }
    ]
  });
}

export function fileSystemReducer(state: FileSystemState, action: FileSystemAction): FileSystemState {
  switch (action.type) {
    case 'SET_ROOT':
      return {
        ...state,
        root: action.payload,
        expandedNodes: new Set([action.payload.id])
      };
      
    case 'TOGGLE_NODE':
      const newExpandedNodes = new Set(state.expandedNodes);
      if (newExpandedNodes.has(action.payload)) {
        newExpandedNodes.delete(action.payload);
      } else {
        newExpandedNodes.add(action.payload);
      }
      return {
        ...state,
        expandedNodes: newExpandedNodes
      };
      
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNode: action.payload
      };
      
    case 'ADD_NODE':
      const parentNode = findNode(state.root, action.payload.parentId);
      if (!parentNode) return state;
      
      return {
        ...state,
        root: updateNode(state.root, action.payload.parentId, {
          children: [...(parentNode.children || []), action.payload.node]
        })
      };
      
    case 'DELETE_NODE':
      return {
        ...state,
        root: deleteNode(state.root, action.payload)
      };
      
    case 'RENAME_NODE':
      return {
        ...state,
        root: updateNode(state.root, action.payload.id, {
          name: action.payload.newName
        })
      };
      
    case 'MOVE_NODE':
      return {
        ...state,
        root: moveNode(state.root, action.payload.nodeId, action.payload.newParentId)
      };
      
    default:
      return state;
  }
}

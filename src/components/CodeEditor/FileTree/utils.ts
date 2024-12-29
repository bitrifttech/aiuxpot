import { FileTreeNodeType } from "./types";

interface FileTreeMap {
  [key: string]: FileTreeNodeType;
}

export const buildFileTree = (files: string[]): FileTreeNodeType[] => {
  console.log('Building file tree with files:', files);
  const root: FileTreeMap = {};

  // First pass: create all directories and files
  files.forEach(filePath => {
    // Normalize path to use forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentPath = '';
    let currentLevel = root;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!currentLevel[currentPath]) {
        currentLevel[currentPath] = {
          name: part,
          path: currentPath,
          type: index === parts.length - 1 ? 'file' : 'directory',
          children: [],
        };
      }

      if (index < parts.length - 1) {
        const children = currentLevel[currentPath].children || [];
        currentLevel[currentPath].children = children;
        currentLevel = children.reduce((acc: FileTreeMap, node) => {
          acc[node.path] = node;
          return acc;
        }, {});
      }
    });
  });

  // Second pass: organize into tree structure
  const tree: FileTreeNodeType[] = [];
  const addedPaths = new Set<string>();

  files.forEach(filePath => {
    // Normalize path to use forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!addedPaths.has(currentPath)) {
        const node = root[currentPath];
        const parentPath = parts.slice(0, index).join('/');
        
        if (!parentPath) {
          tree.push(node);
        } else if (root[parentPath]) {
          root[parentPath].children = root[parentPath].children || [];
          root[parentPath].children.push(node);
        }
        
        addedPaths.add(currentPath);
      }
    });
  });

  // Sort the tree: directories first, then files, both alphabetically
  const sortNodes = (nodes: FileTreeNodeType[]): FileTreeNodeType[] => {
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined
    }));
  };

  // Ensure all directories are properly marked
  const markDirectories = (node: FileTreeNodeType): FileTreeNodeType => {
    if (node.children && node.children.length > 0) {
      node.type = 'directory';
      node.children = node.children.map(markDirectories);
    }
    return node;
  };

  return sortNodes(tree.map(markDirectories));
};
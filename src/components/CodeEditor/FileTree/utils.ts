import { FileTreeNodeType, FileTreeStructure } from "./types";

export const buildFileTree = (files: string[]): FileTreeNodeType[] => {
  console.log('Building file tree with files:', files);
  const root: FileTreeStructure = {};

  files.forEach(filePath => {
    const parts = filePath.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += '/' + part;
      if (!currentLevel[currentPath]) {
        currentLevel[currentPath] = {
          name: part,
          path: currentPath,
          type: index === parts.length - 1 ? 'file' : 'directory',
          children: index === parts.length - 1 ? undefined : []
        };
      }
      if (index !== parts.length - 1) {
        if (!currentLevel[currentPath].children) {
          currentLevel[currentPath].children = [];
        }
        const nextLevel: FileTreeStructure = {};
        currentLevel = nextLevel;
      }
    });
  });

  return Object.values(root);
};
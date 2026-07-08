export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export interface Tab {
  id: string; // File path serves as unique ID
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
}

export interface ElectronAPI {
  openFolderDialog: () => Promise<{ path: string; name: string; tree: FileNode[] } | null>;
  openFileDialog: () => Promise<{ path: string; name: string; content: string } | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  getFolderTree: (folderPath: string) => Promise<FileNode[]>;
  createFile: (dirPath: string, name: string) => Promise<FileNode>;
  createFolder: (dirPath: string, name: string) => Promise<FileNode>;
  renamePath: (oldPath: string, newPath: string) => Promise<void>;
  deletePath: (targetPath: string) => Promise<void>;
  showContextMenu: (options: { label: string; action: string }[]) => Promise<string | null>;
  showSaveDialog: (options: { defaultPath?: string }) => Promise<string | null>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', { filePath, content }),
  getFolderTree: (folderPath: string) => ipcRenderer.invoke('get-folder-tree', folderPath),
  createFile: (dirPath: string, name: string) => ipcRenderer.invoke('create-file', { dirPath, name }),
  createFolder: (dirPath: string, name: string) => ipcRenderer.invoke('create-folder', { dirPath, name }),
  renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('rename-path', { oldPath, newPath }),
  deletePath: (targetPath: string) => ipcRenderer.invoke('delete-path', targetPath),
  showContextMenu: (options: { label: string; action: string }[]) => ipcRenderer.invoke('show-context-menu', options),
  showSaveDialog: (options: { defaultPath?: string }) => ipcRenderer.invoke('show-save-dialog', options),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
});

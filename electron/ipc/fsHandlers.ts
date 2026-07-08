import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-electron', 'dist-package', '.DS_Store', '.next', '.nuxt', 'build']);

async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: true,
          children: await buildFileTree(fullPath),
        });
      } else {
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: false,
        });
      }
    }

    return nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

export function registerFsHandlers(mainWindow: BrowserWindow) {
  // Open Folder Dialog
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const folderPath = result.filePaths[0];
    const tree = await buildFileTree(folderPath);
    return {
      path: folderPath,
      name: path.basename(folderPath),
      tree,
    };
  });

  // Open File Dialog
  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'md'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      path: filePath,
      name: path.basename(filePath),
      content,
    };
  });

  // Read File Content
  ipcMain.handle('read-file', async (_, filePath: string) => {
    return await fs.readFile(filePath, 'utf-8');
  });

  // Write File Content
  ipcMain.handle('write-file', async (_, { filePath, content }: { filePath: string; content: string }) => {
    await fs.writeFile(filePath, content, 'utf-8');
  });

  // Get updated folder tree
  ipcMain.handle('get-folder-tree', async (_, folderPath: string) => {
    return await buildFileTree(folderPath);
  });

  // Create File
  ipcMain.handle('create-file', async (_, { dirPath, name }: { dirPath: string; name: string }) => {
    const filePath = path.join(dirPath, name);
    await fs.writeFile(filePath, '', 'utf-8');
    return {
      name,
      path: filePath,
      isDirectory: false,
    };
  });

  // Create Folder
  ipcMain.handle('create-folder', async (_, { dirPath, name }: { dirPath: string; name: string }) => {
    const folderPath = path.join(dirPath, name);
    await fs.mkdir(folderPath, { recursive: true });
    return {
      name,
      path: folderPath,
      isDirectory: true,
      children: [],
    };
  });

  // Rename Path
  ipcMain.handle('rename-path', async (_, { oldPath, newPath }: { oldPath: string; newPath: string }) => {
    await fs.rename(oldPath, newPath);
  });

  // Delete Path
  ipcMain.handle('delete-path', async (_, targetPath: string) => {
    await fs.rm(targetPath, { recursive: true, force: true });
  });

  // Show context menu (returns action chosen by the user)
  ipcMain.handle('show-context-menu', async (_, options: { label: string; action: string }[]) => {
    const { Menu, MenuItem } = require('electron');
    return new Promise((resolve) => {
      const menu = new Menu();
      options.forEach((opt) => {
        menu.append(
          new MenuItem({
            label: opt.label,
            click: () => resolve(opt.action),
          })
        );
      });
      menu.once('menu-will-close', () => {
        // Delay resolving null slightly in case an option click resolves first
        setTimeout(() => resolve(null), 100);
      });
      menu.popup({ window: mainWindow });
    });
  });

  // Show Save Dialog for Save As
  ipcMain.handle('show-save-dialog', async (_, options: { defaultPath?: string }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options.defaultPath,
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'md'] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return null;
    }
    return result.filePath;
  });
}

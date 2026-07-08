import React, { createContext, useContext, useState, useEffect } from 'react';
import { FileNode, Tab } from '../types';

interface EditorContextType {
  workspacePath: string | null;
  workspaceName: string | null;
  fileTree: FileNode[];
  tabs: Tab[];
  activeTabId: string | null;
  selectedNodePath: string | null;
  expandedNodes: Set<string>;
  cursorPos: { line: number; col: number };
  isMaximized: boolean;
  sidebarWidth: number;
  activeSidebarTab: string;
  
  openFolder: () => Promise<void>;
  closeWorkspace: () => void;
  openFile: (filePath: string) => Promise<void>;
  closeTab: (tabId: string) => Promise<void>;
  updateTabContent: (tabId: string, content: string) => void;
  saveActiveFile: () => Promise<void>;
  saveActiveFileAs: () => Promise<void>;
  createNewFile: (dirPath: string, name: string) => Promise<void>;
  createNewFolder: (dirPath: string, name: string) => Promise<void>;
  renamePath: (oldPath: string, newPath: string) => Promise<void>;
  deletePath: (targetPath: string) => Promise<void>;
  
  setActiveTabId: (id: string | null) => void;
  setSelectedNodePath: (path: string | null) => void;
  toggleExpandNode: (path: string) => void;
  setCursorPos: (pos: { line: number; col: number }) => void;
  setSidebarWidth: (width: number) => void;
  setActiveSidebarTab: (tab: string) => void;
  refreshFileTree: () => Promise<void>;

  // Window Controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorStoreProvider');
  }
  return context;
}

function getLanguageByExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

export const EditorStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [activeSidebarTab, setActiveSidebarTab] = useState('explorer');

  // Track window maximize status
  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI) {
        const max = await window.electronAPI.isMaximized();
        setIsMaximized(max);
      }
    };
    checkMaximized();
    window.addEventListener('resize', checkMaximized);
    return () => window.removeEventListener('resize', checkMaximized);
  }, []);

  const openFolder = async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.openFolderDialog();
    if (result) {
      setWorkspacePath(result.path);
      setWorkspaceName(result.name);
      setFileTree(result.tree);
      setTabs([]);
      setActiveTabId(null);
      setSelectedNodePath(null);
      setExpandedNodes(new Set([result.path]));
    }
  };

  const closeWorkspace = () => {
    setWorkspacePath(null);
    setWorkspaceName(null);
    setFileTree([]);
    setTabs([]);
    setActiveTabId(null);
    setSelectedNodePath(null);
    setExpandedNodes(new Set());
  };

  const refreshFileTree = async () => {
    if (!workspacePath || !window.electronAPI) return;
    const tree = await window.electronAPI.getFolderTree(workspacePath);
    setFileTree(tree);
  };

  const openFile = async (filePath: string) => {
    if (!window.electronAPI) return;

    // Check if already open
    const existingTab = tabs.find((t) => t.path === filePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      setSelectedNodePath(filePath);
      return;
    }

    try {
      const content = await window.electronAPI.readFile(filePath);
      const name = filePath.split(/[/\\]/).pop() || 'Untitled';
      const language = getLanguageByExtension(name);

      const newTab: Tab = {
        id: filePath,
        name,
        path: filePath,
        content,
        language,
        isDirty: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(filePath);
      setSelectedNodePath(filePath);
    } catch (error) {
      console.error('Failed to open file:', error);
      alert(`Error reading file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const closeTab = async (tabId: string) => {
    const tabToClose = tabs.find((t) => t.id === tabId);
    if (!tabToClose) return;

    if (tabToClose.isDirty) {
      const confirmClose = window.confirm(
        `Do you want to save the changes you made to ${tabToClose.name}?\nYour changes will be lost if you don't save them.`
      );
      if (!confirmClose) {
        // User cancelled closing the tab
        return;
      }
    }

    const closedIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Switch to adjacent tab
        const nextActiveIndex = Math.min(closedIndex, newTabs.length - 1);
        setActiveTabId(newTabs[nextActiveIndex].id);
        setSelectedNodePath(newTabs[nextActiveIndex].path);
      } else {
        setActiveTabId(null);
        setSelectedNodePath(null);
      }
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, isDirty: true } : t))
    );
  };

  const saveActiveFile = async () => {
    if (!activeTabId || !window.electronAPI) return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    try {
      await window.electronAPI.writeFile(activeTab.path, activeTab.content);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isDirty: false } : t))
      );
    } catch (error) {
      console.error('Failed to save file:', error);
      alert(`Error saving file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveActiveFileAs = async () => {
    if (!activeTabId || !window.electronAPI) return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    try {
      const newPath = await window.electronAPI.showSaveDialog({
        defaultPath: activeTab.path,
      });

      if (!newPath) return; // User cancelled

      await window.electronAPI.writeFile(newPath, activeTab.content);

      // Close current tab and open new tab with new name
      const name = newPath.split(/[/\\]/).pop() || 'Untitled';
      const language = getLanguageByExtension(name);
      
      const newTab: Tab = {
        id: newPath,
        name,
        path: newPath,
        content: activeTab.content,
        language,
        isDirty: false,
      };

      setTabs((prev) => prev.filter((t) => t.id !== activeTabId).concat(newTab));
      setActiveTabId(newPath);
      setSelectedNodePath(newPath);
      
      await refreshFileTree();
    } catch (error) {
      console.error('Failed to Save As:', error);
      alert(`Error in Save As: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const createNewFile = async (dirPath: string, name: string) => {
    if (!window.electronAPI) return;
    try {
      const newNode = await window.electronAPI.createFile(dirPath, name);
      await refreshFileTree();
      await openFile(newNode.path);
    } catch (error) {
      console.error('Failed to create file:', error);
      alert(`Error creating file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const createNewFolder = async (dirPath: string, name: string) => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.createFolder(dirPath, name);
      await refreshFileTree();
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert(`Error creating folder: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const renamePath = async (oldPath: string, newPath: string) => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.renamePath(oldPath, newPath);
      await refreshFileTree();

      // Update open tabs
      setTabs((prev) =>
        prev.map((t) => {
          if (t.path === oldPath) {
            const name = newPath.split(/[/\\]/).pop() || 'Untitled';
            return { ...t, id: newPath, path: newPath, name, language: getLanguageByExtension(name) };
          }
          if (t.path.startsWith(oldPath + '/')) {
            const relativePart = t.path.slice(oldPath.length);
            const nextPath = newPath + relativePart;
            const name = nextPath.split(/[/\\]/).pop() || 'Untitled';
            return { ...t, id: nextPath, path: nextPath, name, language: getLanguageByExtension(name) };
          }
          return t;
        })
      );

      if (activeTabId === oldPath) {
        setActiveTabId(newPath);
      } else if (activeTabId?.startsWith(oldPath + '/')) {
        setActiveTabId(newPath + activeTabId.slice(oldPath.length));
      }
    } catch (error) {
      console.error('Failed to rename:', error);
      alert(`Error renaming: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const deletePath = async (targetPath: string) => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.deletePath(targetPath);
      await refreshFileTree();

      // Filter out closed tabs immediately from list to avoid prompt (user already deleted from explorer)
      const remainingTabs = tabs.filter(
        (t) => t.path !== targetPath && !t.path.startsWith(targetPath + '/')
      );

      setTabs(remainingTabs);

      if (activeTabId && (activeTabId === targetPath || activeTabId.startsWith(targetPath + '/'))) {
        if (remainingTabs.length > 0) {
          setActiveTabId(remainingTabs[0].id);
          setSelectedNodePath(remainingTabs[0].path);
        } else {
          setActiveTabId(null);
          setSelectedNodePath(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(`Error deleting: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const toggleExpandNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const minimizeWindow = () => window.electronAPI?.minimizeWindow();
  const maximizeWindow = () => window.electronAPI?.maximizeWindow();
  const closeWindow = () => window.electronAPI?.closeWindow();

  return (
    <EditorContext.Provider
      value={{
        workspacePath,
        workspaceName,
        fileTree,
        tabs,
        activeTabId,
        selectedNodePath,
        expandedNodes,
        cursorPos,
        isMaximized,
        sidebarWidth,
        activeSidebarTab,
        
        openFolder,
        closeWorkspace,
        openFile,
        closeTab,
        updateTabContent,
        saveActiveFile,
        saveActiveFileAs,
        createNewFile,
        createNewFolder,
        renamePath,
        deletePath,
        
        setActiveTabId,
        setSelectedNodePath,
        toggleExpandNode,
        setCursorPos,
        setSidebarWidth,
        setActiveSidebarTab,
        refreshFileTree,

        minimizeWindow,
        maximizeWindow,
        closeWindow,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

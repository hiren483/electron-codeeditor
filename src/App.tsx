import React, { useEffect } from 'react';
import { TitleBar } from './components/TitleBar/TitleBar';
import { ActivityBar } from './components/ActivityBar/ActivityBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TabBar } from './components/TabBar/TabBar';
import { Editor } from './components/Editor/Editor';
import { StatusBar } from './components/StatusBar/StatusBar';
import { useEditor } from './store/editorStore';

export const App: React.FC = () => {
  const {
    tabs,
    activeTabId,
    workspacePath,
    setActiveTabId,
    setSelectedNodePath,
    createNewFile,
    openFolder,
    saveActiveFile,
    saveActiveFileAs,
    closeTab,
  } = useEditor();

  // Register Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl) {
        // Ctrl/Cmd + N (New File)
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          if (workspacePath) {
            const name = window.prompt('Enter new file name:');
            if (name) {
              await createNewFile(workspacePath, name);
            }
          } else {
            alert('Please open a folder (workspace) first to create new files.');
          }
        }
        
        // Ctrl/Cmd + O (Open Folder)
        else if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          await openFolder();
        }

        // Ctrl/Cmd + Shift + S (Save As)
        else if (e.shiftKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          if (activeTabId) {
            await saveActiveFileAs();
          }
        }

        // Ctrl/Cmd + S (Save)
        else if (!e.shiftKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          if (activeTabId) {
            await saveActiveFile();
          }
        }

        // Ctrl/Cmd + W (Close Tab)
        else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          if (activeTabId) {
            await closeTab(activeTabId);
          }
        }

        // Ctrl/Cmd + Tab (Cycle Tabs)
        else if (e.key === 'Tab') {
          e.preventDefault();
          if (tabs.length > 1) {
            const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTabId(tabs[nextIndex].id);
            setSelectedNodePath(tabs[nextIndex].path);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tabs,
    activeTabId,
    workspacePath,
    setActiveTabId,
    setSelectedNodePath,
    createNewFile,
    openFolder,
    saveActiveFile,
    saveActiveFileAs,
    closeTab,
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden text-gray-300 font-sans select-none">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Leftmost Activity Bar */}
        <ActivityBar />

        {/* Sidebar (File Explorer / Search / Settings) */}
        <Sidebar />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
          {/* Tabs bar */}
          {tabs.length > 0 && <TabBar />}

          {/* Main workspace editor */}
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default App;

import React from 'react';
import { useEditor } from '../../store/editorStore';
import { Minus, Square, X, Code } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const {
    workspaceName,
    tabs,
    activeTabId,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isMaximized,
  } = useEditor();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  
  // Compute window title text
  let windowTitle = 'Desktop Code Editor';
  if (activeTab) {
    windowTitle = `${activeTab.name}${activeTab.isDirty ? ' •' : ''} - ${activeTab.path}`;
  } else if (workspaceName) {
    windowTitle = `${workspaceName} [Workspace]`;
  }

  return (
    <div className="h-10 bg-[#3c3c3c] flex items-center justify-between border-b border-[#2b2b2b] select-none titlebar-drag text-xs text-gray-300">
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-2 pl-3 titlebar-nodrag">
        <Code size={16} className="text-[#007acc]" />
        <span className="font-semibold text-gray-200">Editor</span>
      </div>

      {/* Center title text */}
      <div className="flex-1 text-center font-normal truncate max-w-[60%] select-none pointer-events-none">
        {windowTitle}
      </div>

      {/* Native window buttons */}
      <div className="flex items-center h-full titlebar-nodrag">
        <button
          onClick={minimizeWindow}
          className="h-full px-4 hover:bg-[#4d4d4d] flex items-center transition-colors focus:outline-none"
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={maximizeWindow}
          className="h-full px-4 hover:bg-[#4d4d4d] flex items-center transition-colors focus:outline-none"
          title={isMaximized ? 'Restore Down' : 'Maximize'}
        >
          <Square size={10} />
        </button>
        <button
          onClick={closeWindow}
          className="h-full px-4 hover:bg-[#e81123] hover:text-white flex items-center transition-colors focus:outline-none"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
export default TitleBar;

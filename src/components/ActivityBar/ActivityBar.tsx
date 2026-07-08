import React from 'react';
import { useEditor } from '../../store/editorStore';
import { Files, Search, Settings, FolderOpen, LogOut } from 'lucide-react';

export const ActivityBar: React.FC = () => {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    sidebarWidth,
    setSidebarWidth,
    openFolder,
    workspacePath,
    closeWorkspace
  } = useEditor();

  const handleTabClick = (tabName: string) => {
    if (activeSidebarTab === tabName && sidebarWidth > 0) {
      // Toggle sidebar collapse
      setSidebarWidth(0);
    } else {
      if (sidebarWidth === 0) {
        setSidebarWidth(250);
      }
      setActiveSidebarTab(tabName);
    }
  };

  return (
    <div className="w-12 bg-[#333333] flex flex-col justify-between items-center py-2 border-r border-[#2b2b2b] select-none">
      {/* Top half */}
      <div className="flex flex-col gap-1 w-full items-center">
        {/* Explorer icon */}
        <button
          onClick={() => handleTabClick('explorer')}
          className={`p-3 relative group w-full flex justify-center focus:outline-none transition-colors ${
            activeSidebarTab === 'explorer' && sidebarWidth > 0
              ? 'text-white border-l-2 border-[#007acc] bg-[#2a2d2e]'
              : 'text-[#858585] hover:text-white'
          }`}
          title="Explorer"
        >
          <Files size={22} />
          <span className="absolute left-14 bg-[#252526] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Explorer
          </span>
        </button>

        {/* Search icon */}
        <button
          onClick={() => handleTabClick('search')}
          className={`p-3 relative group w-full flex justify-center focus:outline-none transition-colors ${
            activeSidebarTab === 'search' && sidebarWidth > 0
              ? 'text-white border-l-2 border-[#007acc] bg-[#2a2d2e]'
              : 'text-[#858585] hover:text-white'
          }`}
          title="Search"
        >
          <Search size={22} />
          <span className="absolute left-14 bg-[#252526] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Search (In Progress)
          </span>
        </button>

        {/* Quick Open Folder */}
        <button
          onClick={openFolder}
          className="p-3 relative group w-full flex justify-center text-[#858585] hover:text-white focus:outline-none transition-colors"
          title="Open Folder..."
        >
          <FolderOpen size={22} />
          <span className="absolute left-14 bg-[#252526] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Open Folder...
          </span>
        </button>
      </div>

      {/* Bottom half */}
      <div className="flex flex-col gap-1 w-full items-center">
        {workspacePath && (
          <button
            onClick={closeWorkspace}
            className="p-3 relative group w-full flex justify-center text-[#858585] hover:text-red-400 focus:outline-none transition-colors"
            title="Close Workspace"
          >
            <LogOut size={20} />
            <span className="absolute left-14 bg-[#252526] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Close Workspace
            </span>
          </button>
        )}

        <button
          onClick={() => handleTabClick('settings')}
          className={`p-3 relative group w-full flex justify-center focus:outline-none transition-colors ${
            activeSidebarTab === 'settings' && sidebarWidth > 0
              ? 'text-white border-l-2 border-[#007acc] bg-[#2a2d2e]'
              : 'text-[#858585] hover:text-white'
          }`}
          title="Settings"
        >
          <Settings size={22} />
          <span className="absolute left-14 bg-[#252526] text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};
export default ActivityBar;

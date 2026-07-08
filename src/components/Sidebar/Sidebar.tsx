import React, { useRef, useEffect } from 'react';
import { useEditor } from '../../store/editorStore';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { Search, Settings, HelpCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    sidebarWidth,
    setSidebarWidth,
    activeSidebarTab,
    workspacePath,
    openFolder,
  } = useEditor();

  const isResizingRef = useRef(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.classList.add('cursor-col-resize', 'select-none');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(150, Math.min(600, e.clientX - 48)); // 48px is ActivityBar width
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.classList.remove('cursor-col-resize', 'select-none');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSidebarWidth]);

  if (sidebarWidth === 0) return null;

  return (
    <div
      style={{ width: sidebarWidth }}
      className="bg-[#252526] h-full flex flex-row relative select-none shrink-0 border-r border-[#2b2b2b]"
    >
      {/* Content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeSidebarTab === 'explorer' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-[#2b2b2b] select-none">
              <span>Explorer</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {workspacePath ? (
                <FileExplorer />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-sm text-gray-500">
                  <p className="mb-4">No workspace opened.</p>
                  <button
                    onClick={openFolder}
                    className="px-4 py-2 bg-[#007acc] hover:bg-[#0062a3] text-white rounded transition-colors text-xs font-medium focus:outline-none"
                  >
                    Open Folder
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSidebarTab === 'search' && (
          <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
              <Search size={14} /> Search
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-gray-500">
              <p>Project-wide search functionality</p>
              <p className="text-[10px] text-gray-600 mt-1">(Under development)</p>
            </div>
          </div>
        )}

        {activeSidebarTab === 'settings' && (
          <div className="flex-1 flex flex-col h-full p-4 overflow-hidden text-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
              <Settings size={14} /> Settings
            </div>
            <div className="flex flex-col gap-4 text-gray-400 mt-2">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Theme</label>
                <select className="w-full bg-[#1e1e1e] border border-[#3c3c3c] p-1.5 rounded focus:outline-none focus:border-[#007acc]">
                  <option>One Dark Theme</option>
                  <option>VS Code Dark (Default)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Font Family</label>
                <input
                  type="text"
                  value="JetBrains Mono, Fira Code"
                  disabled
                  className="w-full bg-[#1e1e1e] border border-[#3c3c3c] p-1.5 rounded text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-4 mt-2">
                <span className="flex items-center gap-1">
                  <HelpCircle size={14} /> Version
                </span>
                <span className="text-gray-500 font-semibold">1.0.0</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag handler */}
      <div
        onMouseDown={startResize}
        className="w-1 absolute right-0 top-0 bottom-0 cursor-col-resize hover:bg-[#007acc] active:bg-[#007acc] transition-colors z-40"
      />
    </div>
  );
};
export default Sidebar;

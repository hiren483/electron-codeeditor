import React, { useRef, useEffect } from 'react';
import { useEditor } from '../../store/editorStore';
import { X } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, setSelectedNodePath } = useEditor();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string, path: string) => {
    setActiveTabId(tabId);
    setSelectedNodePath(path);
  };

  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  // Auto scroll to active tab when changed
  useEffect(() => {
    if (activeTabId && scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-9 bg-[#2d2d2d] flex items-center overflow-x-auto overflow-y-hidden border-b border-[#2b2b2b] select-none scrollbar-none"
      style={{ scrollbarWidth: 'none' }} // Hide scrollbar for standard look
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            data-active={isActive}
            onClick={() => handleTabClick(tab.id, tab.path)}
            className={`group h-full px-3.5 flex items-center justify-between gap-2 border-r border-[#252526] text-xs cursor-pointer select-none min-w-[120px] max-w-[200px] shrink-0 transition-colors ${
              isActive
                ? 'bg-[#1e1e1e] text-white font-medium border-t-2 border-[#007acc]'
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2b2b2b] hover:text-[#e1e1e1]'
            }`}
            title={tab.path}
          >
            {/* Filename */}
            <span className="truncate max-w-[140px]">{tab.name}</span>

            {/* Unsaved indicator or Close button */}
            <div className="flex items-center justify-center w-4 h-4 rounded hover:bg-[#383838] transition-colors relative">
              {tab.isDirty ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#007acc] group-hover:hidden" />
                  <button
                    onClick={(e) => handleCloseClick(e, tab.id)}
                    className="hidden group-hover:flex items-center justify-center w-full h-full text-gray-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => handleCloseClick(e, tab.id)}
                  className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full text-gray-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default TabBar;

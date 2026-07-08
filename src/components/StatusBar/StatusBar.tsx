import React from 'react';
import { useEditor } from '../../store/editorStore';

export const StatusBar: React.FC = () => {
  const { tabs, activeTabId, cursorPos } = useEditor();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Capitalize first letter of language
  const languageDisplay = activeTab
    ? activeTab.language.charAt(0).toUpperCase() + activeTab.language.slice(1)
    : 'Plain Text';

  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none shrink-0">
      {/* Left items */}
      <div className="flex items-center gap-3 truncate">
        {activeTab ? (
          <span className="truncate" title={activeTab.path}>
            {activeTab.path} {activeTab.isDirty ? '(Unsaved)' : ''}
          </span>
        ) : (
          <span>No opened files</span>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4 shrink-0 font-medium">
        {activeTab && (
          <>
            <span>{languageDisplay}</span>
            <span>UTF-8</span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
export default StatusBar;

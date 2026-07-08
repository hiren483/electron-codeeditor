import React from 'react';
import { useEditor } from '../../store/editorStore';
import { FileNode } from '../../types';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const {
    workspacePath,
    fileTree,
    openFile,
    expandedNodes,
    toggleExpandNode,
    selectedNodePath,
    setSelectedNodePath,
    createNewFile,
    createNewFolder,
    renamePath,
    deletePath,
  } = useEditor();

  const handleContextMenu = async (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodePath(node.path);

    if (!window.electronAPI) return;
    
    // Custom context menu items depending on if directory or file
    const menuOptions = node.isDirectory
      ? [
          { label: 'New File...', action: 'new-file' },
          { label: 'New Folder...', action: 'new-folder' },
          { label: 'Rename...', action: 'rename' },
          { label: 'Delete', action: 'delete' },
        ]
      : [
          { label: 'Rename...', action: 'rename' },
          { label: 'Delete', action: 'delete' },
        ];

    const action = await window.electronAPI.showContextMenu(menuOptions);
    if (!action) return;

    if (action === 'new-file') {
      const name = window.prompt('Enter file name:');
      if (name) {
        await createNewFile(node.path, name);
      }
    } else if (action === 'new-folder') {
      const name = window.prompt('Enter folder name:');
      if (name) {
        await createNewFolder(node.path, name);
      }
    } else if (action === 'rename') {
      const newName = window.prompt('Enter new name:', node.name);
      if (newName) {
        const lastSlash = node.path.lastIndexOf('/');
        const newPath = node.path.substring(0, lastSlash + 1) + newName;
        await renamePath(node.path, newPath);
      }
    } else if (action === 'delete') {
      const confirm = window.confirm(`Are you sure you want to delete ${node.name}?`);
      if (confirm) {
        await deletePath(node.path);
      }
    }
  };

  const handleRootContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!workspacePath || !window.electronAPI) return;

    const action = await window.electronAPI.showContextMenu([
      { label: 'New File...', action: 'new-file' },
      { label: 'New Folder...', action: 'new-folder' },
      { label: 'Refresh Explorer', action: 'refresh' },
    ]);

    if (action === 'new-file') {
      const name = window.prompt('Enter file name:');
      if (name) {
        await createNewFile(workspacePath, name);
      }
    } else if (action === 'new-folder') {
      const name = window.prompt('Enter folder name:');
      if (name) {
        await createNewFolder(workspacePath, name);
      }
    } else if (action === 'refresh') {
      const { refreshFileTree } = useEditor();
      await refreshFileTree();
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const isSelected = selectedNodePath === node.path;
    const paddingLeft = `${depth * 12 + 8}px`;

    const handleNodeClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedNodePath(node.path);
      if (node.isDirectory) {
        toggleExpandNode(node.path);
      } else {
        await openFile(node.path);
      }
    };

    return (
      <div key={node.path} className="flex flex-col text-xs font-normal">
        {/* Node Item */}
        <div
          onClick={handleNodeClick}
          onContextMenu={(e) => handleContextMenu(e, node)}
          style={{ paddingLeft }}
          className={`h-7 flex items-center gap-1.5 cursor-pointer select-none text-gray-300 explorer-node-hover ${
            isSelected ? 'bg-[#37373d] text-white font-semibold' : ''
          }`}
        >
          {node.isDirectory ? (
            <>
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-gray-500 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen size={16} className="text-[#e2b85a] shrink-0" />
              ) : (
                <Folder size={16} className="text-[#e2b85a] shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-[14px]" /> {/* Spacer matching chevron */}
              <File size={15} className="text-gray-400 shrink-0" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>

        {/* Children */}
        {node.isDirectory && isExpanded && node.children && (
          <div className="flex flex-col">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onContextMenu={handleRootContextMenu}
      className="h-full w-full py-1 overflow-x-hidden overflow-y-auto flex flex-col bg-[#252526]"
    >
      {fileTree.length > 0 ? (
        fileTree.map((node) => renderNode(node))
      ) : (
        <div className="p-4 text-xs text-gray-500 italic">Empty workspace</div>
      )}
    </div>
  );
};
export default FileExplorer;

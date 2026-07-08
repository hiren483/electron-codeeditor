import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../store/editorStore';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

export const Editor: React.FC = () => {
  const { activeTabId, tabs, updateTabContent, setCursorPos } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keep a map of saved EditorStates to preserve cursor position and history on tab switch
  const editorStatesRef = useRef<{ [tabId: string]: EditorState }>({});
  
  // Ref to track active tab ID inside listeners
  const activeTabIdRef = useRef<string | null>(null);
  activeTabIdRef.current = activeTabId;

  // Ref to track last seen content to avoid infinite update loops
  const lastContentRef = useRef<string>('');

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Helper to determine languages extensions
  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return javascript({ jsx: true });
      case 'typescript':
        return javascript({ jsx: true, typescript: true });
      case 'html':
        return html();
      case 'css':
        return css();
      case 'json':
        return json();
      case 'markdown':
        return markdown();
      default:
        return [];
    }
  };

  useEffect(() => {
    // If no active tab or container, destroy editor view
    if (!activeTabId || !activeTab || !containerRef.current) {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    // Save state of the previous active tab before switching if view exists
    const prevActiveTabId = Object.keys(editorStatesRef.current).find(
      (id) => viewRef.current && id !== activeTabId && editorStatesRef.current[id] === viewRef.current.state
    );
    if (prevActiveTabId && viewRef.current) {
      editorStatesRef.current[prevActiveTabId] = viewRef.current.state;
    }

    // Clean up current view
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Initialize content tracker
    lastContentRef.current = activeTab.content;

    // Define extensions
    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      indentOnInput(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      foldGutter(),
      oneDark,
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      getLanguageExtension(activeTab.language),
      EditorView.lineWrapping, // Always enable word wrapping
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
      ]),
      // Listen to state/selection updates
      EditorView.updateListener.of((update) => {
        if (update.selectionSet || update.docChanged) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursorPos({
            line: line.number,
            col: pos - line.from + 1,
          });
        }
        if (update.docChanged && activeTabIdRef.current) {
          const content = update.state.doc.toString();
          if (content !== lastContentRef.current) {
            lastContentRef.current = content;
            updateTabContent(activeTabIdRef.current, content);
          }
        }
      }),
    ];

    // Load or create state
    let state = editorStatesRef.current[activeTabId];
    if (!state) {
      state = EditorState.create({
        doc: activeTab.content,
        extensions,
      });
      editorStatesRef.current[activeTabId] = state;
    } else {
      // Re-configure extensions if language or activeTab content changes externally
      // If content doesn't match state doc (e.g. file reloaded or saved-as), re-create state
      if (state.doc.toString() !== activeTab.content) {
        state = EditorState.create({
          doc: activeTab.content,
          extensions,
        });
        editorStatesRef.current[activeTabId] = state;
      }
    }

    // Create new view
    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Focus editor
    view.focus();

    return () => {
      if (viewRef.current) {
        // Save state on unmount or transition
        if (activeTabIdRef.current) {
          editorStatesRef.current[activeTabIdRef.current] = viewRef.current.state;
        }
      }
    };
  }, [activeTabId]);

  return (
    <div className="flex-1 h-full w-full bg-[#1e1e1e] overflow-hidden flex flex-col relative">
      {activeTabId ? (
        <div ref={containerRef} className="flex-1 w-full h-full text-left overflow-auto" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-500 bg-[#1e1e1e] select-none gap-2">
          <p className="text-base text-gray-400 font-semibold mb-2">Welcome to Desktop Code Editor</p>
          <div className="flex flex-col gap-1.5 text-xs text-gray-600">
            <div className="flex justify-between w-48"><span className="text-gray-500 font-medium">Open File</span><kbd className="bg-[#2d2d2d] px-1 rounded text-gray-400 border border-[#3c3c3c]">Ctrl+O</kbd></div>
            <div className="flex justify-between w-48"><span className="text-gray-500 font-medium">Open Folder</span><kbd className="bg-[#2d2d2d] px-1 rounded text-gray-400 border border-[#3c3c3c]">Cmd+O / Ctrl+O</kbd></div>
            <div className="flex justify-between w-48"><span className="text-gray-500 font-medium">New File</span><kbd className="bg-[#2d2d2d] px-1 rounded text-gray-400 border border-[#3c3c3c]">Ctrl+N</kbd></div>
            <div className="flex justify-between w-48"><span className="text-gray-500 font-medium">Save As</span><kbd className="bg-[#2d2d2d] px-1 rounded text-gray-400 border border-[#3c3c3c]">Ctrl+Shift+S</kbd></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Editor;

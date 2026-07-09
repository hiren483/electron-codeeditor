# Electron Desktop Code Editor

A lightweight, VS Code-inspired desktop code editor built from scratch using **Electron**, **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **CodeMirror 6**.

[![Electron](https://img.shields.io/badge/Electron-v31.1-blue.svg?logo=electron&style=flat-square)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61dafb.svg?logo=react&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.2-blue.svg?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.3-646cff.svg?logo=vite&style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-v6.0-4f5d95.svg?style=flat-square)](https://codemirror.net/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## Features

### Workspace & Native File Explorer
* **Recursive Folder Tree**: Fast, recursive directory scanner ignoring common dependency directories (`node_modules`, `.git`, build output dirs).
* **Folders-First Sorting**: Naturally organizes directories before files alphabetically.
* **Native Context Menu**: Right-click nodes in the file explorer to trigger Native OS actions: *New File*, *New Folder*, *Rename*, and *Delete*.
* **State Retention**: Workspace expansion states (which folders are expanded/collapsed) are remembered across operations.

### Multi-Tab Editor Area
* **CodeMirror 6 Core**: Features word wrap, line numbers, active line highlights, bracket matching, auto-indentation, and rich history operations.
* **Syntax Highlighting**: Supports Javascript, TypeScript (TSX/JSX), HTML, CSS, JSON, and Markdown out of the box.
* **Tab-State Caching**: Remembers and restores the cursor coordinates, scroll offset, and full undo/redo action histories when switching tabs.
* **Unsaved Warnings**: Displays a dirty dot indicator on the Tab and prompts before closing unsaved files.

### Modern Dark Theme Layout
* **Frameless Layout**: Clean title bar showing active workspace paths and custom window control buttons.
* **Horizontal Resizable Sidebar**: Smoothly drag sidebar borders to expand or collapse your directory explorer.
* **Vibrant Details**: Sleek dark scrollbars, tooltips on hover, and active state styles.

---

## Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| <kbd>Ctrl/Cmd</kbd> + <kbd>O</kbd> | Open Workspace Folder |
| <kbd>Ctrl/Cmd</kbd> + <kbd>N</kbd> | Create New File |
| <kbd>Ctrl/Cmd</kbd> + <kbd>S</kbd> | Save Current File |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Save File As... |
| <kbd>Ctrl/Cmd</kbd> + <kbd>W</kbd> | Close Current Tab |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Tab</kbd> | Cycle Between Open Tabs |

---

## Repository Structure

```
desktop-code-editor/
├── electron/
│   ├── main.ts              # Main Process entry & Window configuration
│   ├── preload.ts           # Secure Context Bridge exposing electronAPI
│   └── ipc/
│       └── fsHandlers.ts    # Node.js File System CRUD & Native Dialogs
├── src/
│   ├── main.tsx             # Vite client bootstrap
│   ├── App.tsx              # Application layout root & Global keybinds
│   ├── index.css            # Tailwind directives & Custom scrollbars
│   ├── types/
│   │   └── index.ts         # Global interface mappings
│   ├── store/
│   │   └── editorStore.tsx  # React Context central state provider
│   └── components/
│       ├── TitleBar/        # Drag-support custom title bar
│       ├── ActivityBar/     # Sidebar tabs router (Explorer, search, settings)
│       ├── Sidebar/         # Collapsible width-resizable panel
│       ├── FileExplorer/    # Interactive directory tree
│       ├── TabBar/          # Multi-tab view with dirty states
│       ├── Editor/          # CodeMirror 6 implementation
│       └── StatusBar/       # Active file metrics footer
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.x or higher)
* [npm](https://www.npmjs.com/) (v9.x or higher)

### Installation

1. Clone this repository to your local directory:
   ```bash
   git clone https://github.com/your-username/desktop-code-editor.git
   cd desktop-code-editor
   ```

2. Install all development and production packages:
   ```bash
   npm install
   ```

### Running the Application

* **Development (HMR support)**:
  Run Vite's server in the background, then launch Electron targeting that port:
  ```bash
  # Shell 1
  npm run dev

  # Shell 2
  npm run electron:dev
  ```

* **Production (Bundled assets)**:
  Build React source code and Electron scripts, then run self-contained:
  ```bash
  npm run build
  npx electron .
  ```

### Packaging

Compile and build production packages for **macOS**, **Windows**, or **Linux**:
```bash
npm run electron:build
```

---

##Security Best Practices

This editor implements standard Electron security practices:
1. **Context Isolation**: Enabled inside the renderer.
2. **Node Integration**: Disabled in the renderer to prevent arbitrary system commands execution.
3. **Preload API**: Restricts access via `contextBridge.exposeInMainWorld`, allowing only specific file-management and window actions.


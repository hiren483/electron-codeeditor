# Desktop Code Editor

A lightweight, VS Code-inspired desktop code editor built with Electron, React, TypeScript, Vite, TailwindCSS, and CodeMirror 6.

## Folder Structure

```
desktop-code-editor/
├── electron/
│   ├── main.ts              # Electron Main Process entry
│   ├── preload.ts           # Electron Preload context bridge
│   └── ipc/
│       └── fsHandlers.ts    # Native FS and dialog handlers
├── src/
│   ├── main.tsx             # Vite client entry
│   ├── App.tsx              # Application layout root
│   ├── index.css            # Tailwind and global styles
│   ├── types/
│   │   └── index.ts         # Global interface definitions
│   ├── store/
│   │   └── editorStore.tsx  # React Context state provider
│   └── components/
│       ├── TitleBar/        # Custom window header bar
│       ├── ActivityBar/     # Sidebar selectors (Explorer, settings)
│       ├── Sidebar/         # Collapsible resizing side panel
│       ├── FileExplorer/    # Recursive folders tree with context actions
│       ├── TabBar/          # Editing tabs layout
│       ├── Editor/          # CodeMirror 6 viewport wrapper
│       └── StatusBar/       # Cursor metrics and status footer
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Features

- **Native File Management**: Open file/folder, recursive directory listing, create file/folder, rename, delete, and save/save-as dialogs.
- **Secure Electron IPC**: Restricts Node access in the renderer using `contextBridge` and `ipcRenderer`.
- **Editor Area**: Powered by CodeMirror 6 with line numbers, auto-indent, word wrap, bracket matching, line highlight, and syntax highlighting for JavaScript, TypeScript, CSS, HTML, JSON, and Markdown.
- **Multi-Tab Layout**: Tab switches, dirty state unsaved indicators, close checks, and state caching (scroll positions/histories are retained on switch).
- **Custom Titlebar**: Modern dark frameless overlay supporting standard window controls.
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + N` - New File
  - `Ctrl/Cmd + O` - Open Workspace Folder
  - `Ctrl/Cmd + S` - Save File
  - `Ctrl/Cmd + Shift + S` - Save File As
  - `Ctrl/Cmd + W` - Close Active Tab
  - `Ctrl/Cmd + Tab` - Cycle Open Tabs

## Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development**:
   To run the app with Vite HMR in Electron:
   - In terminal 1, run Vite dev server:
     ```bash
     npm run dev
     ```
   - In terminal 2, run the Electron wrapper:
     ```bash
     npm run electron:dev
     ```

3. **Build the Project**:
   To compile frontend assets and Electron processes:
   ```bash
   npm run build
   ```

4. **Package Application**:
   To package for production (macOS, Windows, or Linux depending on target OS) using Electron Builder:
   ```bash
   npm run electron:build
   ```
# ele

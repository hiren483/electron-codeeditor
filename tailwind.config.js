/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activity: '#333333',
          titlebar: '#3c3c3c',
          statusbar: '#007acc',
          tabActive: '#1e1e1e',
          tabInactive: '#2d2d2d',
          border: '#2b2b2b',
        }
      }
    },
  },
  plugins: [],
}

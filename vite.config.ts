import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative asset paths let the same build run at a domain root or under a subpath such as GitHub Pages.
export default defineConfig({base:'./',plugins:[react()],test:{environment:'node',include:['src/**/*.test.ts']}});

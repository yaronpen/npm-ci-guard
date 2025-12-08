import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'], // Your main entry point
  format: ['esm'],         // Output format (ESM for modern Node)
  dts: true,               // Generate type definitions
  clean: true,             // Clean output dir before build
  shims: true,             // Inject shims for __dirname etc. (helpful for CLIs)
});
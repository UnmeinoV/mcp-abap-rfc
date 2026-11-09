#!/usr/bin/env node

/**
 * mcp-abap-rfc launcher
 *
 * Main entry point: runs dist/server/launcher.js in this process.
 *
 * NOTE: Using direct require() instead of spawn() to ensure proper stdio handling.
 * spawn() with stdio: 'inherit' can cause issues with MCP protocol
 * because the parent process becomes an unnecessary intermediate layer.
 */

// The Windows SDK PATH prepend lives in src/lib/rfcModule.ts
// (assertRfcModuleLoadable), so every entry point gets it.

// Just require the server entry point directly - this runs the server in the same process
// with proper stdin/stdout handling for MCP protocol
require('../dist/server/launcher.js');

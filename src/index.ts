/**
 * Package entry point → compiles to `dist/index.js`.
 *
 * Exports nothing: this is a server, not a library. Executed directly
 * (`node dist/index.js …`) it boots the MCP server, identical to
 * `bin/mcp-abap-rfc.js`.
 */

if (require.main === module) {
  // Side-effect import: requiring the launcher starts the MCP server, reading
  // its options from process.argv (same as bin/mcp-abap-rfc.js).
  require('./server/launcher.js');
}

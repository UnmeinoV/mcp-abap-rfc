# Developer Tools

Utility scripts for development and maintenance of mcp-abap-rfc.

## Available Tools

### 1. Documentation Generator

**`generate-tools-docs.js`** - Automatically generates tool documentation from handler files.

**Purpose:** Creates `doc/user-guide/AVAILABLE_TOOLS.md` by extracting `TOOL_DEFINITION` from all handler files.

**Usage:**
```bash
npm run docs:tools
# or
node tools/generate-tools-docs.js [--help]
```

**What it does:**
- Scans all handler files in `src/handlers/`
- Extracts `TOOL_DEFINITION` from each handler
- Groups tools by category (Programs, Tables, Enhancements, etc.)
- Generates markdown documentation with:
  - Tool descriptions
  - Parameter lists with types and descriptions
  - Example JSON for each tool
  - Special notes (e.g., ABAP Cloud limitations)

**Output:** `doc/user-guide/AVAILABLE_TOOLS.md`

**When to use:**
- After adding new tools
- After updating tool descriptions
- Before releasing a new version
- To keep documentation in sync with code

---

### 2. TOOL_DEFINITION Helper

**`update-handlers-with-tool-definitions.js`** - Helps add `TOOL_DEFINITION` to handler files.

**Purpose:** Checks handler files and assists in adding `TOOL_DEFINITION` exports if missing.

**Usage:**
```bash
node tools/update-handlers-with-tool-definitions.js [--help]
```

**What it does:**
- Scans all handler files in `src/handlers/`
- Checks if each handler has `TOOL_DEFINITION`
- If missing, suggests a basic `TOOL_DEFINITION` based on:
  - Handler function name
  - JSDoc comments (if available)
- Adds the definition to the file

**⚠️ Important:** Auto-generated `TOOL_DEFINITION` is incomplete! You must:
- Review and update the description
- Complete `inputSchema.properties` to match handler parameters
- Set the `required` array correctly
- Add default values if needed

**When to use:**
- When creating a new handler file
- When migrating old handlers to new architecture
- To verify all handlers have `TOOL_DEFINITION`

**Best practice:** Manually add `TOOL_DEFINITION` following existing patterns. Use this script only as a starting point.

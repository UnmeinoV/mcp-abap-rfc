#!/usr/bin/env node
/**
 * 把本 MCP server 安装到使用方工程，或全局安装到 Claude Code。
 *
 * 工程模式：
 *   node scripts/install-mcp.js --target=/path/to/my-abap-project [--name=dev] [--exposition=readonly,high]
 *     - 复制 .env.example  ->  <目标>/env/<系统名>.env      （已存在则不覆盖）
 *     - 创建/合并          ->  <目标>/.mcp.json            （条目 "abap-rfc-<系统名>"）
 *       server 命令指向本 clone 的 bin/mcp-abap-rfc.js（按脚本位置计算的绝对路径），
 *       env 文件用工程内相对路径引用（--env-path=env/<系统名>.env）。
 *
 * 全局模式（Claude Code 用户级）：
 *   node scripts/install-mcp.js --global [--name=dev] [--exposition=readonly,high]
 *     - 复制 .env.example  ->  标准 sessions 目录下的 <系统名>.env
 *       （Unix: ~/.config/mcp-abap-rfc/sessions，Windows: %USERPROFILE%\Documents\mcp-abap-rfc\sessions）
 *     - 把 "abap-rfc-<系统名>"（--env-path=<该 env 文件的绝对路径>）注册到 ~/.claude.json（先写备份）
 *
 * 无第三方依赖；要求 Node >= 18。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const binPath = path
  .join(repoRoot, 'bin', 'mcp-abap-rfc.js')
  .replace(/\\/g, '/');
const envTemplate = path.join(repoRoot, '.env.example');

function usage(exitCode) {
  console.log(`用法：
  node scripts/install-mcp.js --target=<工程目录> [--name=<系统名>] [--exposition=<工具集>]
  node scripts/install-mcp.js --global            [--name=<系统名>] [--exposition=<工具集>]

参数：
  --target=<目录>      安装到指定工程：写入 <目录>/env/<系统名>.env 和 <目录>/.mcp.json
  --global             全局安装（所有工程可用）：env 写入标准 sessions 目录，
                       server 条目注册到 ~/.claude.json（Claude Code 用户级）
  --name=<系统名>      系统名，用于 env 文件名与 server 标识 "abap-rfc-<系统名>"（默认：mysystem）
  --exposition=<工具集> 暴露的工具集（默认：readonly,high）
  --codex / --no-codex 是否同时注册到 Codex（~/.codex/config.toml）。
                       默认自动：检测到 ~/.codex 即注册；--codex 强制、--no-codex 跳过
  --help               显示本帮助

说明：默认同时给 Claude Code 与 Codex 注册（Codex 按上面的自动规则）。`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const opts = {
    name: 'mysystem',
    exposition: 'readonly,high',
    global: false,
    target: null,
    // Codex registration: 'auto' = register only if ~/.codex exists; true =
    // always (create dir); false = never.
    codex: 'auto',
  };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') usage(0);
    else if (arg === '--global') opts.global = true;
    else if (arg === '--codex') opts.codex = true;
    else if (arg === '--no-codex') opts.codex = false;
    else if (arg.startsWith('--target='))
      opts.target = arg.slice('--target='.length);
    else if (arg.startsWith('--name=')) opts.name = arg.slice('--name='.length);
    else if (arg.startsWith('--exposition='))
      opts.exposition = arg.slice('--exposition='.length);
    else {
      console.error(`未知参数：${arg}\n`);
      usage(1);
    }
  }
  if (!opts.global && !opts.target) {
    console.error('必须指定 --target=<目录> 或 --global 之一。\n');
    usage(1);
  }
  if (opts.global && opts.target) {
    console.error('--target 与 --global 不能同时使用。\n');
    usage(1);
  }
  if (!/^[\w.-]+$/.test(opts.name)) {
    console.error(
      `--name "${opts.name}" 非法：只能使用字母、数字、"."、"_"、"-"。`,
    );
    process.exit(1);
  }
  return opts;
}

function sessionsDir() {
  return process.platform === 'win32'
    ? path.join(os.homedir(), 'Documents', 'mcp-abap-rfc', 'sessions')
    : path.join(os.homedir(), '.config', 'mcp-abap-rfc', 'sessions');
}

function copyEnvTemplate(destFile) {
  if (fs.existsSync(destFile)) {
    console.log(`  env 文件已存在，保持不变：${destFile}`);
    return false;
  }
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.copyFileSync(envTemplate, destFile);
  // 这个文件之后会写入 SAP 密码：非 Windows 下只允许本人读写（0600）。
  if (process.platform !== 'win32') fs.chmodSync(destFile, 0o600);
  console.log(`  已创建 ${destFile}（复制自 .env.example）`);
  return true;
}

function readJsonOrDefault(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(
      `拒绝修改 ${file}：文件已存在但不是合法 JSON（${err.message}）。`,
    );
    console.error('请先修复或删除该文件，再重新运行。');
    process.exit(1);
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function serverEntry(envArg, exposition) {
  return {
    command: 'node',
    args: [binPath, envArg, `--exposition=${exposition}`],
    env: { NODE_TLS_REJECT_UNAUTHORIZED: '0' },
  };
}

/** Codex reads MCP servers from the user-level ~/.codex/config.toml (TOML). */
function codexConfigPath() {
  return path.join(os.homedir(), '.codex', 'config.toml');
}

/**
 * Should we register into Codex? 'auto' (default) → only when ~/.codex exists
 * (i.e. Codex is installed); true → always (create the dir); false → never.
 */
function codexEnabled(opts) {
  if (opts.codex === true) return true;
  if (opts.codex === false) return false;
  return fs.existsSync(path.join(os.homedir(), '.codex'));
}

/**
 * Insert or replace a [mcp_servers.<id>] block in a TOML file WITHOUT a TOML
 * dependency: locate the section header, replace through the next section header
 * (or EOF), or append when absent. Paths use forward slashes so no TOML
 * backslash-escaping is needed (node accepts "/" on Windows). A backup is
 * written first, like the ~/.claude.json path.
 */
function upsertCodexServer(configPath, serverId, envArg, exposition) {
  const header = `[mcp_servers.${serverId}]`;
  const argsToml = [binPath, envArg, `--exposition=${exposition}`]
    .map((a) => JSON.stringify(a))
    .join(', ');
  const block = [
    header,
    'command = "node"',
    `args = [${argsToml}]`,
    'env = { NODE_TLS_REJECT_UNAUTHORIZED = "0" }',
  ].join('\n');

  const exists = fs.existsSync(configPath);
  const text = exists ? fs.readFileSync(configPath, 'utf8') : '';
  if (exists) {
    const backup = `${configPath}.bak-install-mcp`;
    fs.copyFileSync(configPath, backup);
    console.log(`  已写入备份：${backup}`);
  } else {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  const lines = text.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => l.trim() === header);
  let result;
  if (startIdx === -1) {
    const base = text.replace(/\s*$/, '');
    const newText = `${base ? `${base}\n\n` : ''}${block}\n`;
    fs.writeFileSync(configPath, newText, 'utf8');
    result = 'added';
  } else {
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^\s*\[/.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    const merged = [
      ...lines.slice(0, startIdx),
      ...block.split('\n'),
      '',
      ...lines.slice(endIdx),
    ]
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s*$/, '');
    fs.writeFileSync(configPath, `${merged}\n`, 'utf8');
    result = 'updated';
  }
  return result;
}

/** Register the server into Codex (~/.codex/config.toml) when enabled. */
function registerCodex(serverId, envArg, opts) {
  if (!codexEnabled(opts)) {
    console.log('\nCodex：未检测到 ~/.codex（Codex 未安装）——已跳过。');
    console.log(
      '      若要同时给 Codex 注册，安装 Codex 后加 --codex 重跑本脚本。',
    );
    return;
  }
  const cfg = codexConfigPath();
  const action = upsertCodexServer(cfg, serverId, envArg, opts.exposition);
  console.log(
    `  已${action === 'updated' ? '更新' : '添加'} "[mcp_servers.${serverId}]" 到 ${cfg}`,
  );
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(envTemplate)) {
    console.error(`未找到模板文件：${envTemplate}`);
    process.exit(1);
  }
  if (!fs.existsSync(path.join(repoRoot, 'dist', 'server', 'launcher.js'))) {
    console.warn(
      '警告：未找到 dist/server/launcher.js —— 请先在本仓库执行 "npm run build"，',
    );
    console.warn('      否则注册的 server 将无法启动。\n');
  }

  const serverId = `abap-rfc-${opts.name}`;

  if (opts.global) {
    console.log(`全局安装（Claude Code 用户级），标识 "${serverId}"：`);
    const envFile = path.join(sessionsDir(), `${opts.name}.env`);
    const envCreated = copyEnvTemplate(envFile);
    // mcp-abap-rfc has no --env=<name> lookup: name the file itself.
    const envArg = `--env-path=${envFile.replace(/\\/g, '/')}`;

    const claudeJson = path.join(os.homedir(), '.claude.json');
    const config = readJsonOrDefault(claudeJson, {});
    if (fs.existsSync(claudeJson)) {
      const backup = `${claudeJson}.bak-install-mcp`;
      fs.copyFileSync(claudeJson, backup);
      console.log(`  已写入备份：${backup}`);
    }
    config.mcpServers = config.mcpServers || {};
    const existed = Boolean(config.mcpServers[serverId]);
    config.mcpServers[serverId] = serverEntry(envArg, opts.exposition);
    writeJson(claudeJson, config);
    console.log(
      `  已${existed ? '更新' : '添加'} "${serverId}" 到 ${claudeJson}（Claude Code）`,
    );

    // Codex uses the SAME absolute env file (CWD-independent).
    registerCodex(serverId, envArg, opts);

    console.log(
      '\n若使用 Claude Code / Codex 以外的 MCP 客户端，请手动注册以下条目：',
    );
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            [serverId]: serverEntry(envArg, opts.exposition),
          },
        },
        null,
        2,
      ),
    );
    finish(envFile, envCreated, true);
    return;
  }

  const target = path.resolve(opts.target);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.error(`目标目录不存在：${target}`);
    process.exit(1);
  }
  console.log(`安装到工程 ${target}，标识 "${serverId}"：`);

  const envFile = path.join(target, 'env', `${opts.name}.env`);
  const envCreated = copyEnvTemplate(envFile);

  const mcpJson = path.join(target, '.mcp.json');
  const config = readJsonOrDefault(mcpJson, {});
  config.mcpServers = config.mcpServers || {};
  const existed = Boolean(config.mcpServers[serverId]);
  config.mcpServers[serverId] = serverEntry(
    `--env-path=env/${opts.name}.env`,
    opts.exposition,
  );
  writeJson(mcpJson, config);
  console.log(
    `  已${existed ? '更新' : '添加'} "${serverId}" 到 ${mcpJson}（Claude Code，项目级）`,
  );
  console.log(
    '\n提示：请把 "env/" 加入该工程的 .gitignore —— env 文件包含账号密码。',
  );

  // Codex has no per-project config — its MCP servers live in the global
  // ~/.codex/config.toml. Since Codex does not run the server from the project
  // dir, use an ABSOLUTE env path (a project-relative one would not resolve).
  const absEnv = envFile.replace(/\\/g, '/');
  registerCodex(serverId, `--env-path=${absEnv}`, opts);

  finish(envFile, envCreated, false);
}

function finish(envFile, envCreated, isGlobal) {
  console.log('\n后续步骤：');
  let step = 1;
  if (envCreated) {
    console.log(
      `  ${step++}. 编辑 ${envFile} —— 填写 SAP_ASHOST/SAP_SYSNR/SAP_CLIENT/账号密码（文件内有中文注释说明）。`,
    );
  }
  // 为什么要重启：MCP 客户端只在启动时读取配置文件，运行中的会话不会热加载
  // 新加的 server，也无法用 /mcp 现场加载 —— 必须重启会话。
  console.log(
    `  ${step++}. 重启 MCP 客户端以加载新 server（客户端仅在启动时读取配置，不支持热加载）：`,
  );
  console.log(
    '       · Claude Code：退出当前会话（连按两次 Ctrl+C，或 Ctrl+D），再重新运行 `claude`；',
  );
  if (isGlobal) {
    console.log(`       启动后可用 /mcp 确认 "abap-rfc" 开头的 server 已连接。`);
  } else {
    console.log(
      '       首次启动会提示批准本工程的 server（项目级 .mcp.json 需确认），或用 /mcp 批准/查看状态。',
    );
  }
  console.log(
    '       · Codex：完全退出并重开 Codex（它仅在启动时读取 ~/.codex/config.toml）；',
  );
  console.log(
    '       · 其它客户端（Cline / Copilot 等）：按各自方式重启或重载 MCP 配置。',
  );
}

main();

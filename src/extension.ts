import * as vscode from 'vscode';
import { glob } from 'glob';
import path from 'path';
import { log, dispose, logSettingSubscription } from './logger';
import { ConfigMappings, ConfigOptionsEnum } from './types';
import { enableCommand, disableCommand } from './commands';


const TAILWIND_CONFIG = 'tailwindCSS.rootFontSize';
const pathCache = new Map<string, number>();
let mappingsConfig: ConfigMappings;

export async function activate(context: vscode.ExtensionContext) {
  registerCommands(context, [enableCommand, disableCommand, restartCommand]);
  manageEventSubscriptions(context);

  if (isExtensionEnabled()) {
    log('Activating Tailwind Dynamic Root Font Size extension');
    await initialize();
  } else {
    log('Tailwind Dynamic Root Font Size extension is disabled. Enable it from the settings.');
    return;
  }
}

function registerCommands(context: vscode.ExtensionContext, commands: vscode.Disposable[]) {
  commands.forEach((command) => context.subscriptions.push(command));
}

function manageEventSubscriptions(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(handleConfigurationChange));
  context.subscriptions.push(logSettingSubscription);
  vscode.window.onDidChangeActiveTextEditor(setForCurrentFile);
}

function handleConfigurationChange(e: vscode.ConfigurationChangeEvent) {
  if (e.affectsConfiguration(ConfigOptionsEnum.MAPPINGS)) {
    log('[Config] Configuration changed. Reloading mappings.');
    pathCache.clear();
    createMappings();
  }
}

async function initialize() {
  await createMappings();
  setForCurrentFile(vscode.window.activeTextEditor);
}

function isExtensionEnabled() {
  return vscode.workspace.getConfiguration().get<boolean>(ConfigOptionsEnum.ENABLE) === true;
}

function addFileToCache(filePath: string) {
  for (const [size, globs] of Object.entries(mappingsConfig)) {
    if (glob.sync(globs, { cwd: path.dirname(filePath) }).length > 0) {
      pathCache.set(filePath, parseInt(size));
      log(`[Cache] Added ${filePath} with font size ${size}`, { logLevel: 'debug' });
      setRootFontSize({ fontSize: parseInt(size) });
    } else {
      log(`[Cache] No matching glob found for ${filePath}`, { logLevel: 'debug' });
      setRootFontSize({ fontSize: 16 });
    }
  }
}

const setForCurrentFile = async (editor: vscode.TextEditor | undefined) => {
  const fsPath = editor?.document.uri.fsPath;

  // check if valid path to file
  if (!fsPath || !editor || editor.document.uri.scheme !== 'file') {
    return;
  }

  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    return;
  }

  const filePath = path.relative(workspacePath, fsPath);

  log(`[Event] File changed: ${filePath}`, { logLevel: 'debug' });
  if (pathCache.has(filePath)) {
    log(`[Cache] Found ${filePath} in the cache`, { logLevel: 'debug' });
    const size = pathCache.get(filePath);

    setRootFontSize({
      fontSize: size || 16,
    });
  } else {
    addFileToCache(filePath);
  }
};

async function createMappings() {
  const config = vscode.workspace.getConfiguration().get<ConfigMappings>(ConfigOptionsEnum.MAPPINGS);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!config) {
    log('[Config] No mappings found in the configuration. Provide a valid configuration to continue.', {
      logLevel: 'debug',
    });
    return;
  }
  if (!workspaceFolder) {
    log('[Config] No workspace folder found. Please open a workspace to continue.', { logLevel: 'debug' });
    return;
  }
  mappingsConfig = config;
  log(`[Config] Mappings found in the configuration ${JSON.stringify(mappingsConfig)}`);

  for (const [size, globs] of Object.entries(mappingsConfig)) {
    const fontSize = parseInt(size);

    log(`[GLOB] finding files for font size ${fontSize}`, { logLevel: 'debug' });
    const matches = await glob(globs, { cwd: workspaceFolder.uri.fsPath, ignore: ['**/node_modules/**'] });

    log(`[GLOB] found ${matches.length} files for font size ${fontSize}`);
    matches.forEach((match) => {
      pathCache.set(match, fontSize);
      log(`[Cache] Added ${match} with font size ${fontSize}`, { logLevel: 'debug' });
    });
  }
}

function setRootFontSize({ fontSize }: { fontSize: number }) {
  if (fontSize !== currentFontSize()) {
    log(`[Config] Setting root font size to ${fontSize}`);
    vscode.workspace.getConfiguration().update(TAILWIND_CONFIG, fontSize, vscode.ConfigurationTarget.Workspace);
  }
}

function currentFontSize() {
  return vscode.workspace.getConfiguration().get<number>(TAILWIND_CONFIG);
}

export function deactivate() {
  dispose();
  log('Tailwind Dynamic Root Font Size extension deactivated');
}

export const restartCommand = vscode.commands.registerCommand('tailwindcss-dynamicrootFontSize.restart', () => {
  log('Restarting Tailwind Dynamic Root Font Size extension');
  pathCache.clear();
  createMappings();
});
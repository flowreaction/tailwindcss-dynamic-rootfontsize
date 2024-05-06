import * as vscode from 'vscode';
import { type Config } from './types';

type Options = {
  logLevel: Config['tailwindcss-dynamic-rootFontSize.logLevel'];
};


let logLevel = vscode.workspace.getConfiguration().get<string>('tailwindcss-dynamic-rootFontSize.logLevel') || 'info';

const logOutput = vscode.window.createOutputChannel('Tailwind Dynamic Root Font Size');

export const log = (message: string, options?: Options) => {
  const level = options?.logLevel || 'info';
  if (logLevel !== level) {
    return;
  }
  logOutput.appendLine(message);
};

export const dispose = () => {
  logOutput.dispose();
};

export const logSettingSubscription = vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('tailwindcss-dynamic-rootFontSize.logLevel')) {
    logLevel = vscode.workspace.getConfiguration().get<string>('tailwindcss-dynamic-rootFontSize.logLevel') || 'info';
  }
});
import * as vscode from 'vscode';
import {log} from './logger';
import {ConfigOptionsEnum} from './types';


export const enableCommand = vscode.commands.registerCommand('tailwindcss-dynamicrootFontSize.enable', () => {
  vscode.workspace.getConfiguration().update(ConfigOptionsEnum.ENABLE, true, vscode.ConfigurationTarget.Global);
  log('Tailwind Dynamic Root Font Size extension enabled');
});

export const disableCommand = vscode.commands.registerCommand('tailwindcss-dynamicrootFontSize.disable', () => {
  vscode.workspace.getConfiguration().update(ConfigOptionsEnum.ENABLE, false, vscode.ConfigurationTarget.Global);
  log('Tailwind Dynamic Root Font Size extension disabled');
});

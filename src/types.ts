export type ConfigMappings = { [key: string]: string | string[] };

export type Config = {
  'tailwindcss-dynamic-rootFontSize.mappings': ConfigMappings;
  'tailwindcss-dynamic-rootFontSize.enable': boolean;
  'tailwindcss-dynamic-rootFontSize.logLevel': 'info' | 'error' | 'warn' | 'debug';
};

export enum ConfigOptionsEnum {
  MAPPINGS = 'tailwindcss-dynamic-rootFontSize.mappings',
  ENABLE = 'tailwindcss-dynamic-rootFontSize.enable',
}
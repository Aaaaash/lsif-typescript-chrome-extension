import { SymbolKind } from 'vscode-languageserver-types';

export const TypeScriptExtensionsChannel = 'lsif-typescript-channel';

export const wsAddress = global.process.env.SERVER_URL;

export const githubCodeViewSelector = 'js-file-line-container';

export const githubCodeCellSelector = 'blob-code blob-code-inner js-file-line';

export const symbolKindNames = {
    [SymbolKind.Array]: 'array',
    [SymbolKind.Boolean]: 'boolean',
    [SymbolKind.Class]: 'class',
    [SymbolKind.Constant]: 'constant',
    [SymbolKind.Constructor]: 'constructor',
    [SymbolKind.Enum]: 'enumeration',
    [SymbolKind.EnumMember]: 'enumeration member',
    [SymbolKind.Event]: 'event',
    [SymbolKind.Field]: 'field',
    [SymbolKind.File]: 'file',
    [SymbolKind.Function]: 'function',
    [SymbolKind.Interface]: 'interface',
    [SymbolKind.Key]: 'key',
    [SymbolKind.Method]: 'method',
    [SymbolKind.Module]: 'module',
    [SymbolKind.Namespace]: 'namespace',
    [SymbolKind.Null]: 'null',
    [SymbolKind.Number]: 'number',
    [SymbolKind.Object]: 'object',
    [SymbolKind.Operator]: 'operator',
    [SymbolKind.Package]: 'package',
    [SymbolKind.Property]: 'property',
    [SymbolKind.String]: 'string',
    [SymbolKind.Struct]: 'struct',
    [SymbolKind.TypeParameter]: 'type parameter',
    [SymbolKind.Variable]: 'variable',
}

export const quotesReg = /^\'|"|\'|"$/g;

export const AGENT = 'AGENT';
export const AGENTCONNECTION = 'AGENT-CONNECTION';

export const storageName = 'LSIF-TYPESCRIPT-EXTENSION-STORAGE';

export const defaultStorageConfig = {
    enable: true,
    codingEnterprise: true,
    gitHub: true,
    documentSymbol: true,
    hoverAction: true,
    gotoDefinition: true,
}

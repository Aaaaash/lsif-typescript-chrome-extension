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

export enum CONNECTION_TYPE {
    agent = 'AGENT',
    agentConnection = 'AGENT-CONNECTION',
}

export const storageName = 'LSIF-TYPESCRIPT-EXTENSION-STORAGE';

export const defaultStorageConfig = {
    enable: true,
    codingEnterprise: true,
    gitHub: true,
    documentSymbol: true,
    hoverAction: true,
    gotoDefinition: true,
}

export const MODIFIERS_LIST = ['meta', 'ctrl', 'shift', 'alt'];

export const keyCodeToKey = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    46: 'del',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: '\'',
};

for (let k = 1; k < 20; k++) {
    keyCodeToKey[111 + k] = `f${k}`;
}

export const keyToKeyCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    return: 13,
    esc: 27,
    escape: 27,
    space: 32,
    spacebar: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    del: 46,
    delete: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    ';': 186,
    '=': 187,
    ',': 188,
    comma: 188,
    '-': 189,
    '.': 190,
    '/': 191,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221,
    '\'': 222,
};

for (let k = 1; k < 20; k++) {
    keyToKeyCode[`f${k}`] = 111 + k;
}

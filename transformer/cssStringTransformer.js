const ts = require('typescript');
const path = require('path');
const fs = require('fs');
const valueParser = require('postcss-value-parser');
const base64JS = require('base64-js');

const quotesRegexp = /^\'|"|\'|"$/g;
const dataUrlRegexp = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)$/i;

function isImportNode(node) {
    return (
        node.kind === ts.SyntaxKind.ImportDeclaration
    );
}

function isCssStringImportCall(node) {
    return node.moduleSpecifier.getText().replace(quotesRegexp, '').startsWith('cssToString');
}

function nullCssString(named) {
    return ts.createVariableDeclarationList(
        [
            ts.createVariableDeclaration(named, undefined, ts.createStringLiteral(''))
        ],
        ts.NodeFlags.Const,
    );
}

function transformCssBgImageToDataUrl(textBuffer) {
    return base64JS.fromByteArray(textBuffer);
}

function replaceImportDeclarationToCssString(node) {
    const relativePath = node.moduleSpecifier.getText().replace(quotesRegexp, '').split('!!').pop();
    const sourceFileName = node.getSourceFile().fileName;
    const sourceFileDir = path.dirname(sourceFileName);
    const absolutePath = path.resolve(sourceFileDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Can not found file ${absolutePath}`);
        return nullCssString(node.importClause);
    }

    const sourceCssContent = fs.readFileSync(absolutePath).toString();
    const parsed = valueParser(sourceCssContent);

    parsed.walk((node) => {
        if(node.type !== 'function' || node.value !== 'url') {
            return;
        }

        node.nodes = node.nodes.map((childNode) => {
            if (childNode.type === 'string' && dataUrlRegexp.test(childNode.value)) {
                return childNode;
            }

            const cssFileDir = path.dirname(absolutePath);
            const bgImagePath = path.resolve(cssFileDir, childNode.value);
            const transformed = transformCssBgImageToDataUrl(fs.readFileSync(bgImagePath));

            return {
                ...childNode,
                value: `data:image/svg+xml;base64,${transformed}`,
            };
        });
    });

    return ts.createVariableDeclarationList(
        [
            ts.createVariableDeclaration(node.importClause, undefined, ts.createStringLiteral(parsed.toString()))
        ],
        ts.NodeFlags.Const,
    );
}

module.exports = function createCssStringTransformer(service) {
    function cssStringTransformer(context) {
        return (node) => {
            if (node.kind !== ts.SyntaxKind.SourceFile) {
                return node;
            }

            const visitor = child => {
                if (isImportNode(child) && isCssStringImportCall(child)) {
                    const cssStringNode = replaceImportDeclarationToCssString(child);
                    return cssStringNode;
                }

                ts.forEachChild(child, n => {
                    if (!n.parent) n.parent = child;
                });

                return ts.visitEachChild(child, visitor, context);
            };

            return ts.visitNode(node, visitor);
        }
    }

    return cssStringTransformer;
}

const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const quotesReg = /^\'|"|\'|"$/g;

function isImportNode(node) {
    return (
        node.kind === ts.SyntaxKind.ImportDeclaration
    );
}

function isCssStringImportCall(node) {
    return node.moduleSpecifier.getText().replace(quotesReg, '').startsWith('cssToString');
}

function nullCssString(named) {
    return ts.createVariableDeclarationList(
        [
            ts.createVariableDeclaration(named, undefined, ts.createStringLiteral(''))
        ],
        ts.NodeFlags.Const,
    );
}

function replaceImportDeclarationToCssString(node) {
    const relativePath = node.moduleSpecifier.getText().replace(quotesReg, '').split('!!').pop();
    const sourceFileName = node.getSourceFile().fileName;
    const sourceFileDir = path.dirname(sourceFileName);
    const absolutePath = path.resolve(sourceFileDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Can not found file ${absolutePath}`);
        return nullCssString(node.importClause);
    }

    const textContent = fs.readFileSync(absolutePath).toString();
    return ts.createVariableDeclarationList(
        [
            ts.createVariableDeclaration(node.importClause, undefined, ts.createStringLiteral(textContent))
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

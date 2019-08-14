## LSIF TypeScript Chrome Extensions

[![Build Status](https://travis-ci.org/Aaaaash/lsif-typescript-chrome-extension.svg?branch=master)](https://travis-ci.org/Aaaaash/lsif-typescript-chrome-extension)

### Features

- Navigate to document symbols

![](snapshot/navigate.png)

- Hover (show symbol type and description)
![](snapshot/hover.png)

- Go to definition

![](snapshot/hover-navigate-jump.gif)

### TODO

- ~~优化 hover 样式~~
- ~~支持 gotoDefinition (有限的)~~
- 支持 findReferences
- ~~支持 CODING interprise (有限的)~~
- ~~Options 页面, 允许启用或关闭部分特性~~
- DOM 操作性能优化
- 探索索引文件本地存储方案
- 支持文件内符号搜索跳转
- 使用 Web Component 重构插件界面元素, 隔离 CSS 作用域, 避免 CSS 污染


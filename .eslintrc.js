module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['typescript'],
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: ['plugin:@typescript-eslint/recommended'],
	parserOptions: {
		ecmaVersion: 6,
        sourceType: 'module',
        jsx: true,
		ecmaFeatures: {
			modules: true
		}
	},
	rules: {
		eqeqeq: [
			'error',
			'always',
			{
				null: 'ignore'
			}
		],
		indent: 'off',
		quotes: ['error', 'single'],									// 字符串优先使用单引号 '', 模板字符串使用反引号 ``, 包含多层引号使用单引号包双引号 const name = '这是一个"双层引号示例"'
		"@typescript-eslint/no-explicit-any": 'warn',					// 尽量不要显式 any
		'@typescript-eslint/no-use-before-define': 'error',				// 禁止在定义前使用变量
		'@typescript-eslint/indent': ['error', 4],						// 关闭 @typescript-eslint 插件的缩进格式检查
		'@typescript-eslint/no-non-null-assertion': 'warn',				// 尽量不要使用非空断言
		'@typescript-eslint/interface-name-prefix': 'off',				// 是否禁止 interface 命名以 I 开头, 待议
		'@typescript-eslint/no-var-requires': 'off',					// 允许使用 require
		'@typescript-eslint/explicit-function-return-type': ['warn', {	// 建议显式写明函数返回类型
			allowExpressions: true,										// 允许部分箭头表达式不写返回类型 someArr.map((item) => {...})
		}],
		'@typescript-eslint/no-namespace': 'warn',						// 不推荐使用 namespace, 官方建议使用 esmodule -> import/exports, namespace 结合 esmodule 使用会出现令人困扰的场景 https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html#needless-namespacing
		'@typescript-eslint/no-angle-bracket-type-assertion': 'warn',	// 尽量使用 as Type 进行类型断言, <Type> 断言可能会与 tsx 语法产生冲突(例如部分插件 webview)
		'@typescript-eslint/no-parameter-properties': 'off',			// 关闭类构造函数中直接声明类属性检查 意味着允许 constructor(public field: someType) {...} 写法
		'@typescript-eslint/camelcase': ['warn'],						// 变量函数声明尽量使用驼峰命名法, 不建议使用下划线
		'@typescript-eslint/no-object-literal-type-assertion': 'off',	// 关闭禁止为对象字面量使用类型断言的检查
		'@typescript-eslint/no-triple-slash-reference': 'off',			// 允许 /// 引入类型声明
		'@typescript-eslint/explicit-member-accessibility': 'off',		// 关闭强制显式声明类成员访问修饰符, 意味着默认 public 成员可无需显式声明
		'@typescript-eslint/no-empty-interface': 'warn',				// 尽量不要声明空接口
		'@typescript-eslint/array-type': [
			'warn',
			'array-simple'
		]
	}
};

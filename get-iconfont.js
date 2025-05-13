#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * @Author: kai
 * @Date: 2020-6-18 19:51:08
 * @Description: 用于快速从iconfont下载字体文件 跟项目无关
 */
const fs = require('fs');
const request = require('request');
const argvArr = process.argv;
const updateIndex = argvArr.indexOf('--update');
const mainIndex = argvArr.indexOf('--main');
const logoIndex = argvArr.indexOf('--logo');
if (mainIndex === -1 && logoIndex === -1) {
	console.error('【Error】需要 http://at.alicdn.com/t/c/...后面这一串');
	console.error('示例：node get-iconfont.js --main font_2157480_z0zbmbq3lte --logo font_2157480_z0zbmbq3lte');
	process.exit(0);
}
let basePath = __dirname + '/dist/fonts';
if (updateIndex !== -1) {
	basePath = './src/fonts';
}
console.log(basePath, 'basePath');

const createIconfont = (currentUrl, prefix) => {
	const fontPath = 'http://at.alicdn.com/t/c/' + currentUrl;
	console.log(fontPath);
	const suffixs = ['.ttf', '.css', '.js', '.json'];
	// const suffixs = ['.ttf'];
	const promise = (ele) => {
		return new Promise((resolve, reject) => {
			const downloadPath = `${fontPath}${ele}`;
			const options = {
				method: 'GET',
				url: downloadPath,
				headers: {
					'cache-control': 'no-cache'
				}
			};

			request(options, (error, response, body) => {
				if (error) {
					reject(`iconfont${ele}下载失败了`);
					throw new Error(error);
				}
				if (ele === '.css') {
					const reg = new RegExp(`//at.*?${currentUrl}`, 'g');
					body = body.replace(reg, `../fonts/${prefix}`);
					const cssPath = `${basePath}/${prefix}.css`;
					console.log(cssPath, '<-cssPath');
					fs.writeFileSync(cssPath, body);
				} else if (ele === '.json') {
					const jsonPath = `${basePath}/${prefix}.json`;
					console.log(jsonPath, '<-jsonPath');
					fs.writeFileSync(jsonPath, body);
					const obj = JSON.parse(body);
					const fontNames = obj.glyphs.map((ele) => `"${ele.font_class}"`);
					const type = `export type IconType = ` + fontNames.join(' | ');

					let typePath = `${__dirname}/dist/src/fonts/${prefix}-type.d.ts`;
					if (updateIndex !== -1) {
						typePath = `${basePath}/${prefix}-type.ts`;
					}
					console.log(typePath, '<-typePath');
					fs.writeFileSync(typePath, type);
				} else {
					const downloadPath = `${basePath}/${prefix}${ele}`;
					console.log(downloadPath, '<-downloadPathed');
					fs.writeFileSync(downloadPath, body);
				}
				resolve(`iconfont${ele}下载更新成功`);
			});
		});
	};
	const promises = suffixs.map((ele) => {
		return promise(ele);
	});
	return Promise.all(promises);
};
(async (_createIconfont) => {
	let mainUrl = '';
	if (mainIndex !== -1) {
		mainUrl = argvArr[mainIndex + 1];
		console.log('--------------------------开始处理主库--------------------------');
		const mainRes = await _createIconfont(mainUrl, 'iconfont-main');
		console.log(mainRes);
	}
	let logoUrl = '';
	if (logoIndex !== -1) {
		logoUrl = argvArr[logoIndex + 1];
		console.log('--------------------------开始处理logo库--------------------------');
		const logoRes = await _createIconfont(logoUrl, 'iconfont-logo');
		console.log(logoRes);
	}
	process.exit(0);
})(createIconfont);

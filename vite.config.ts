import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
	// 读取环境变量或命令行参数
	const entry = process.env.BUILD_ENTRY || 'src/index.ts';
	const name = entry.includes('Icon') ? 'DPIcon' : 'DPIconInit';
	const isIconBuild = entry.includes('Icon');

	return {
		build: {
			lib: {
				entry,
				name,
				fileName: (format) => {
					const base = isIconBuild ? 'dp-iconfont.icon' : 'init';
					return `${base}.${format}.js`;
				}
			},
			emptyOutDir: !isIconBuild, // 只有第一次build清空dist，第二次不清空
			rollupOptions: {
				external: [
					'react',
					'react-dom',
					'react/jsx-runtime'
				],
				output: {
					globals: {
						react: 'react',
						'react-dom': 'ReactDOM',
						'react/jsx-runtime': 'jsxRuntime'
					}
				}
			}
		},
		plugins: [
			dts({
				entryRoot: '.',
				outDir: 'dist'
			}) as any,
			copy({
				targets: [
					{
						src: ['src/fonts/*', '!src/fonts/iconfont-main-type.ts'],
						dest: 'dist/fonts',
					},
					{
						src: 'src/Icon.less',
						dest: 'dist'
					}
				],
				hook: 'writeBundle'
			})
		]
	};
});

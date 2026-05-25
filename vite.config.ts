import { defineConfig } from 'vite'
import { visualizer } from "rollup-plugin-visualizer";
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { BASE_PATH } from "./global-config";
import { branchVersionPlugin } from "./vite-plugin/branch-version-vite-plugin";

const host = 'http://192.168.12.245' // test env

const prefixArr: Array<[string, string]> = [
  ['/themis', '9090'], // [path prefix, backend port]
]

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isProduction = mode === "production";
  const isAnalyze = process.env.npm_lifecycle_event === "build:report";
  return {
    base: BASE_PATH,
    plugins: [
      branchVersionPlugin(),
      tailwindcss(),
      react(),
      // 只有在 build:report 时才激活
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/report.html',
        gzipSize: true,
        brotliSize: true,
        // template: "treemap", // 依然支持 treemap, sunburst 等
      }),
    ].filter(Boolean),
    resolve: {
      // 开启原生支持
      tsconfigPaths: true,
    },
    server: {
      proxy: Object.fromEntries(
          prefixArr.map(([prefix, port]) => [prefix, {
            target: `${host}:${port}`,
            changeOrigin: true,
            secure: false,
          }]),
      ),
    },
    build: {
      // target: "es2015", // 默认是 'modules'，即支持 ES 模块的浏览器。可以根据需要设置为 'es2015'、'es2020' 等
      sourcemap: !isProduction,
      // 每个 JS 模块对应的 CSS 会拆分成独立文件，只有用到这个组件时才会加载对应的 CSS。如果不开启，整个项目的 CSS 会打成一个巨型文件
      cssCodeSplit: true,
      minify: "oxc", // 也可以选择 'terser' 、esbuild或 'oxc'。oxc 是一个新的 JavaScript 压缩器，性能更好，压缩效果更佳
      cssMinify: "lightningcss", // 可以选择 'esbuild'、'lightningcss'。lightningcss 是一个专门用于 CSS 压缩的工具，支持更多的 CSS 特性和优化
      rolldownOptions: {
        output: {
          // true 保留License、版权等注释，false 删除所有注释，或者用对象配置
          comments: {
            legal: true, // 保留法律相关的注释，如版权声明、许可证信息等
            annotation: true, // 保留带有特定注释标记的注释，如 @preserve、@license、@cc_on 等
            jsdoc: false, // 删除 JSDoc 注释，除非它们同时满足 legal 或 annotation 的条件
          },
          // 从esbuild 切换到oxc https://cn.vite.dev/guide/migration#javascript-minification-by-oxc
          minify: {
            compress: {
            // 生产环境下删除 console 和 debugger，开发环境保留以方便调试
              dropConsole: isProduction,
              dropDebugger: isProduction,
            },
          },
          codeSplitting: {
            minSize: 20000,
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/]react/,
                priority: 20,
              },
              {
                name: 'ui-vendor',
                test: /node_modules[\\/]antd/,
                priority: 15,
              },
              {
                name: 'vendor',
                test: /node_modules/,
                priority: 10,
              },
              {
                name: 'common',
                minShareCount: 2,
                minSize: 10000,
                priority: 5,
              },
            ],
          },
        },
      },
    },
  }
})

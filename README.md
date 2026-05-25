# React + TypeScript + Vite 精简模板

面向中后台项目的 React 精简模板，偏工程化但保持轻量，用于快速启动新项目。提供开箱即用的动态路由 + 权限控制方案、Vite 生产级构建优化、以及完整的工程规范（ESLint / Biome / Lefthook / commitlint），同时避免过度封装，便于按业务需求裁剪。

核心方案：

- **动态路由 + 权限**：扁平路由表通过 `parentId` 构建树形结构，结合后端返回的权限菜单自动过滤无权限路由，首屏默认重定向到首个有权限页面
- **路由懒加载**：基于 `import.meta.glob` 自动扫描 `src/pages` 下的页面组件，无需手动维护 import
- **统一 Base 路径**：`global-config.ts` 一处配置，Vite `base` 与 Router `basename` 共用
- **生产级构建**：oxc 压缩、lightningcss CSS 压缩、CSS Code Split、按模块拆分样式文件、自动剔除生产环境 console/debugger

## 特性

- Vite + React + TypeScript
- 路由友好的页面结构
- 布局与错误边界脚手架
- 状态管理与请求工具占位
- 主题变量与基础样式
- ESLint/Biome/Lefthook 规范与钩子
- 路由配置简洁，便于管理多层级嵌套页面

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:5173`。

## 脚本

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
```

## 目录结构

```
src/
  assets/
  components/
  hooks/
  layouts/
  pages/
  router/
  server/
  store/
  theme/
  types/
  utils/
```

## 配置说明

- 全局前缀配置在 `global-config.ts`，Vite base 与 Router basename 共用。
- 别名与 Vite 配置在 `vite.config.ts`。
- ESLint/Biome/Lefthook 配置在仓库根目录。
- 路由配置在 `src/router/`，入口见 `src/router/index.tsx`。
- 主题变量与样式在 `src/theme/`。

## 贡献

欢迎提 Issue 和 PR。请保持修改最小化，遵循模板优先的思路。

## 许可证

[MIT License](./LICENSE)

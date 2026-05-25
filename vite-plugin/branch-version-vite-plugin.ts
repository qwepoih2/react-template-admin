import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import type { Plugin } from "vite";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateFormat(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getBranchVersionInfo() {
  let branch = "N/A",
    commitHash = "N/A",
    author = "N/A",
    commitDate = "N/A",
    message = "N/A";

  try {
    const log = execSync('git log -1 --pretty=format:"%cn|%cd|%H|%s" --date=iso').toString().trim();
    [author, commitDate, commitHash, message] = log.split("|");
    branch = execSync("git branch --show-current").toString().trim();
    commitDate = dateFormat(new Date(commitDate));
  } catch {
    // ignore
  }

  const buildTime = dateFormat(new Date());

  let moduleName = "unknown";
  try {
    const pkgPath = path.resolve(import.meta.dirname, "../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    moduleName = pkg.name || "unknown";
  } catch {
    // ignore
  }

  return {
    author,
    module: moduleName,
    branch,
    commitDate,
    commitHash,
    buildTime,
    message,
  };
}

export function branchVersionPlugin(): Plugin {
  // const virtualId = "virtual:branch-version";
  // const resolvedVirtualId = "\0" + virtualId;

  return {
    name: "vite-plugin-branch-version",

    // resolveId(id) {
    //   if (id === virtualId) return resolvedVirtualId;
    // },

    // load(id) {
    //   if (id === resolvedVirtualId) {
    //     const info = getBranchVersionInfo();
    //     return `export default ${JSON.stringify(info)};`;
    //   }
    // },

    transformIndexHtml(html) {
      const info = getBranchVersionInfo();

      const description = [
        `提交人: ${info.author}`,
        `项目: ${info.module}`,
        `分支: ${info.branch}`,
        `最近提交日期: ${info.commitDate}`,
        `hash: ${info.commitHash}`,
        `构建时间: ${info.buildTime}`,
      ].join("\n");

      return html.replace(
        "<title>",
        `<meta name="Description" content="${description}">\n    <title>`,
      );
    },
  };
}

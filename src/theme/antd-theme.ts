import type { ThemeConfig } from "antd";

const getCssVar = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export const token: ThemeConfig["token"] = {
    // 基础色
    colorPrimary: getCssVar("--primary-color"),
    // 功能色
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#f5222d",
    colorInfo: "#1890ff",

    colorBgLayout: "#f0f2f5",
    colorBgContainer: "#fff",
    colorBgElevated: "#fff",

    wireframe: false,
    fontFamily: "Arial, sans-serif",
    fontSize: 14,

    borderRadiusSM: 4,
    borderRadius: 6,
    borderRadiusLG: 8,
};

export const antdThemeConfig: ThemeConfig = {
    // cssVar: true, // 核心：让 antd 去读 :root 里的 --ant 变量
    token: token,
    components: {
        // Button: {
        //     paddingInline: 16,
        //     // 其它非颜色的逻辑配置
        // },
    },
};

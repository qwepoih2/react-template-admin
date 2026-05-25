import { MenuScope } from "#/enum.ts";
import type { AuthMenu, RouteConfig } from "@/types/router";

// flatMenuRoutes 参数说明：
// - id: 当前路由的唯一标识，用于 parentId 关联。
// - parentId: 父级路由 id，顶级路由为空字符串。
// - path: 实际路由路径。
// - component: 页面组件路径（基于 src/pages），为空表示仅作为菜单容器。
// - handle: 业务元信息
//   - type: 菜单类型（如顶级导航）。
//   - title: 菜单/页面标题。
//   - menuKey: 权限菜单 key，对应 authMenus.menuKey。
//   - hideTitle: 是否隐藏页面标题。
//   - hidden: 是否在菜单中隐藏该路由。
//   - ActiveMenu: 被隐藏页面时，用于指定高亮的菜单路径。
//   - projectDisabled/tenantDisabled: 业务维度的禁用开关。
export const flatMenuRoutes: RouteConfig[] = [
    {
        parentId: "",
        id: "offline",
        path: "/offline-sync",
        handle: {
            type: MenuScope.TopNav,
            title: "离线同步",
            menuKey: "biz_module",
        },
    },
    {
        id: "offline-sync",
        parentId: "offline",
        path: "/offline-sync/overview",
        component: "/pages/overview",
        handle: {
            title: "概览",
            hideTitle: true,
            projectDisabled: false,
            tenantDisabled: false,
            menuKey: "biz_overview",
        },
    },
    {
        id: "offline-sync-sync",
        parentId: "offline",
        path: "/offline-sync/sync",
        component: "/pages/offlineSync/index",
        handle: {
            title: "同步",
            hideTitle: true,
            projectDisabled: false,
            tenantDisabled: false,
            menuKey: "biz_list",
        },
    },
    {
        id: "offline-sync-sync-detail",
        parentId: "offline-sync-sync",
        path: "/offline-sync/sync/detail",
        component: "/pages/offlineSync/detail",
        handle: {
            title: "同步详情",
            ActiveMenu: "/offline-sync/sync",
            hideTitle: true,
            hidden: true,
            projectDisabled: false,
            tenantDisabled: false,
        },
    },
    {
        id: "offline-sync-sync-detail2",
        parentId: "offline-sync-sync-detail",
        path: "/offline-sync/sync/detail/detail",
        component: "/pages/offlineSync/detail",
        handle: {
            title: "同步详情2",
            ActiveMenu: "/offline-sync/sync",
            hideTitle: true,
            hidden: true,
            projectDisabled: false,
            tenantDisabled: false,
        },
    },
    {
        id: "offline-sync-sync-detail3",
        parentId: "offline-sync-sync-detail2",
        path: "/offline-sync/sync/detail/detail/3",
        component: "/pages/offlineSync/detail3",
        handle: {
            title: "同步详情3",
            ActiveMenu: "/offline-sync/sync",
            hideTitle: true,
            hidden: true,
            projectDisabled: false,
            tenantDisabled: false,
        },
    },
    {
        parentId: "",
        id: "offline-dev",
        path: "/offline-dev",
        handle: {
            type: MenuScope.TopNav,
            title: "离线开发",
            menuKey: "order_module",
        },
    },
    {
        id: "offline-dev-overview",
        parentId: "offline-dev",
        path: "/offline-dev/overview",
        component: "/pages/overview",
        handle: {
            title: "概览",
            hideTitle: true,
            projectDisabled: false,
            tenantDisabled: false,
            menuKey: "order_overview",
        },
    },
];

// authMenus 模拟后端返回的权限菜单数据结构，实际项目中请根据后端接口调整 AuthMenu 结构和 authMenus 数据。

export const authMenus: AuthMenu[] = [
    {
        name: "业务管理模块",
        menuKey: "biz_module",
        externalUrl: "",
        serialNum: 1,
        btnList: [
            { action_mode: "ADMIN" },
            { action_mode: "UPDATE" },
            { action_mode: "CREATE" },
            { action_mode: "DELETE" },
        ],
    },
    {
        name: "业务概览",
        menuKey: "biz_overview",
        externalUrl: "",
        serialNum: 0,
        btnList: [
            { action_mode: "ADMIN" },
            { action_mode: "UPDATE" },
            { action_mode: "CREATE" },
            { action_mode: "DELETE" },
        ],
    },
    {
        name: "业务列表",
        menuKey: "biz_list",
        externalUrl: "",
        serialNum: 1,
        btnList: [
            { action_mode: "ADMIN" },
            { action_mode: "UPDATE" },
            { action_mode: "CREATE" },
            { action_mode: "DELETE" },
        ],
    },
    {
        name: "订单管理模块",
        menuKey: "order_module",
        externalUrl: "",
        serialNum: 0,
        btnList: [
            { action_mode: "ADMIN" },
            { action_mode: "UPDATE" },
            { action_mode: "CREATE" },
            { action_mode: "DELETE" },
        ],
    },
    {
        name: "订单概览",
        menuKey: "order_overview",
        externalUrl: "",
        serialNum: 0,
        btnList: [
            { action_mode: "ADMIN" },
            { action_mode: "UPDATE" },
            { action_mode: "CREATE" },
            { action_mode: "DELETE" },
        ],
    },
];

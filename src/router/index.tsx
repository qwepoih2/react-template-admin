import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router";
import ErrorBoundary from "@/router/components/error-boundary.tsx";
import React from "react";
import Layout from "@/layouts/index.tsx";
import { menuTree } from "@/router/menu";
import { getFirstAuthorizedPath, lazyRoute, toRouteObjects } from "@/utils/route-resolver.ts";
import { BASE_PATH } from "../../global-config";
export { sidebarMenuTree } from "@/router/menu";

interface RouterConfig {
    basename?: string;
    // mode: 'history' | 'hash';
}

export const dynamicMenuRoutes = toRouteObjects(menuTree);
const defaultAuthorizedPath = getFirstAuthorizedPath(menuTree) ?? "/404";

// 静态路由
const staticRoutes: RouteObject[] = [
    {
        id: "root",
        path: "auth",
        // Component: React.lazy(() => import("@/pages/login.tsx")),
        // 这里直接返回包含 Component 的对象
        lazy: lazyRoute(() => import("@/pages/login.tsx")),
    },
    {
        id: "404",
        path: "404",
        // Component: () => <div>404 Not Found</div>,
        lazy: lazyRoute(() => import("@/pages/404.tsx")),
    },
    { path: "*", element: <Navigate to="/404" replace /> },
];

// 将静态路由和动态菜单路由合并，并使用 Layout 包裹动态路由
const routes: RouteObject[] = [
    ...staticRoutes,
    {
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to={defaultAuthorizedPath} replace />,
            },
            ...dynamicMenuRoutes,
        ],
    },
];

export const createRouter = (
    // 约束 AppComponent 必须能接收 children
    LayoutComponent: React.ComponentType<{ children: React.ReactNode }>,
    config: RouterConfig = {},
) => {
    const mergedConfig: RouterConfig = {
        basename: BASE_PATH,
        ...config,
    };

    return createBrowserRouter(
        [
            {
                element: (
                    <LayoutComponent>
                        <Outlet />
                    </LayoutComponent>
                ),
                errorElement: <ErrorBoundary />,
                children: routes,
            },
        ],
        mergedConfig,
    );
};

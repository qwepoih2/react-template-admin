import { authMenus, flatMenuRoutes } from "@/router/routes";
import { buildAuthorizedMenuTree } from "@/utils/route-resolver";
import type { MenuTree, RouteConfig } from "@/types/router";

export const menuTree = buildAuthorizedMenuTree(flatMenuRoutes, authMenus);

const toLayoutMenus = (items: MenuTree<RouteConfig>[]): RouteConfig[] => {
    return items
        .filter((item) => !item.handle?.hidden)
        .map((item) => ({
            ...item,
            children: item.children ? toLayoutMenus(item.children) : undefined,
        }));
};

export const sidebarMenuTree: RouteConfig[] = toLayoutMenus(menuTree);

console.log(sidebarMenuTree);

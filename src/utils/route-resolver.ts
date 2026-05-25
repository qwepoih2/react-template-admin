import type { AuthAppliedMenu, AuthMenu, MenuTree, RouteConfig } from "@/types/router";
import React from "react";
import { Navigate, type RouteObject } from "react-router";

export const applyAuthDataToMenus = (menus: RouteConfig[], authData: AuthMenu[]): AuthAppliedMenu[] => {
    const authMap = new Map<string, AuthMenu>();
    for (const auth of authData) {
        if (auth.menuKey) {
            authMap.set(auth.menuKey, auth);
        }
    }

    const menuMap = new Map<string, RouteConfig>();
    for (const menu of menus) {
        if (menu.id) {
            menuMap.set(menu.id, menu);
        }
    }

    const isParentAuthorized = (menu: RouteConfig) => {
        const visited = new Set<string>();
        let parentId = menu.parentId;

        while (parentId) {
            if (visited.has(parentId)) return true;
            visited.add(parentId);

            const parent = menuMap.get(parentId);
            if (!parent) return true;
            if (parent.handle?.menuKey && !authMap.has(parent.handle.menuKey)) return false;
            parentId = parent.parentId;
        }

        return true;
    };

    return menus
        .map((menu, index) => {
            const base: AuthAppliedMenu = { ...menu, _order: index };
            const menuKey = menu.handle?.menuKey;
            if (!menuKey) return base;
            const auth = authMap.get(menuKey);
            if (!auth) return null;
            if (!isParentAuthorized(menu)) return null;

            return {
                ...base,
                handle: {
                    ...menu.handle,
                    title: auth.name ?? menu.handle.title,
                    externalUrl: auth.externalUrl,
                    btnList: auth.btnList,
                    serialNum: auth.serialNum,
                    authMatched: true,
                },
            };
        })
        .filter((menu): menu is AuthAppliedMenu => Boolean(menu));
};

export const sortMenusByAuthOrder = (menus: AuthAppliedMenu[]): AuthAppliedMenu[] => {
    const withKey = menus.filter((menu) => Boolean(menu.handle?.menuKey));
    const withoutKey = menus.filter((menu) => !menu.handle?.menuKey);

    withKey.sort((a, b) => {
        const aNum = a.handle?.serialNum ?? Number.MAX_SAFE_INTEGER;
        const bNum = b.handle?.serialNum ?? Number.MAX_SAFE_INTEGER;
        if (aNum !== bNum) return aNum - bNum;
        return (a._order ?? 0) - (b._order ?? 0);
    });

    return [...withKey, ...withoutKey];
};

/**
 * get route path from menu path and parent path
 * @param menuPath '/a/b/c'
 * @param parentPath '/a/b'
 * @returns '/c'
 *
 * @example
 * getRoutePath('/a/b/c', '/a/b') // '/c'
 */
export const getRoutePath = (menuPath?: string, parentPath?: string) => {
    const menuPathArr = menuPath?.split("/").filter(Boolean) || [];
    const parentPathArr = parentPath?.split("/").filter(Boolean) || [];

    return menuPathArr.slice(parentPathArr.length).join("/");
};

export const getFirstVisibleChild = <T extends RouteConfig>(children: MenuTree<T>[]): MenuTree<T> | undefined => {
    for (const child of children) {
        if (!child.path) continue;

        // hidden 节点不作为默认重定向目标，但仍允许递归查找其可见后代。
        if (!child.handle?.hidden) {
            return child;
        }

        if (child.children?.length) {
            const nested = getFirstVisibleChild(child.children);
            if (nested) return nested;
        }
    }

    return undefined;
};

export const getFirstAuthorizedPath = (items: MenuTree<RouteConfig>[]): string | undefined => {
    for (const item of items) {
        if (item.handle?.hidden) continue;
        if (item.component && item.path) return item.path;
        if (item.children?.length) {
            const nested = getFirstAuthorizedPath(item.children);
            if (nested) return nested;
        }
    }
    return undefined;
};

export function convertFlatToTree<T extends RouteConfig>(items: T[]): MenuTree<T>[] {
    const itemMap = new Map<string, MenuTree<T>>();
    const result: MenuTree<T>[] = [];

    for (const item of items) {
        if (!item.id) continue;
        itemMap.set(item.id, { ...item, children: [] });
    }

    for (const item of items) {
        if (!item.id) continue;
        const node = itemMap.get(item.id);
        if (!node) continue;

        if (item.parentId === null || item.parentId === undefined || item.parentId === "") {
            result.push(node);
        } else {
            const parent = itemMap.get(item.parentId as string);
            if (parent) {
                parent.children = parent.children ?? [];
                parent.children.push(node);
            }
        }
    }

    return result;
}

export const buildAuthorizedMenuTree = (menus: RouteConfig[], authData: AuthMenu[]): MenuTree<AuthAppliedMenu>[] => {
    const authed = applyAuthDataToMenus(menus, authData);
    const sorted = sortMenusByAuthOrder(authed);
    return convertFlatToTree(sorted);
};

type PageModule = { default: React.ComponentType };

// 异步加载路由组件的工厂函数
export const lazyRoute = (importer: () => Promise<PageModule>): RouteObject["lazy"] => {
    return async () => {
        const module = await importer();
        return { Component: module.default };
    };
};

const pageModules = import.meta.glob("/src/pages/**/*.tsx");

const getLazyRouteByComponent = (component?: string): RouteObject["lazy"] | undefined => {
    if (!component) return undefined;

    let normalized = component.replace(/\\/g, "/").replace(/\.tsx$/, "");
    if (normalized.startsWith("/src/")) normalized = normalized.slice(4);
    if (!normalized.startsWith("/pages/")) {
        normalized = normalized.startsWith("pages/") ? `/${normalized}` : `/pages/${normalized}`;
    }

    const candidates = [`/src${normalized}.tsx`, `/src${normalized}/index.tsx`];
    const matchedPath = candidates.find((path) => Boolean(pageModules[path]));
    if (!matchedPath) {
        console.warn("Component not found for path:", component);
        return undefined;
    }

    const importer = pageModules[matchedPath] as (() => Promise<PageModule>) | undefined;
    if (!importer) return undefined;

    return lazyRoute(importer);
};

const toRouteMeta = (item: RouteConfig) => {
    return item.handle;
};

export const toRouteObjects = (items: MenuTree<RouteConfig>[], parent?: MenuTree<RouteConfig>): RouteObject[] => {
    return items
        .filter((item) => item.component || (item.children && item.children.length > 0))
        .map((item) => {
            const children = item.children || [];
            const currentLazy = getLazyRouteByComponent(item.component);
            const childRoutes = toRouteObjects(children, item);
            const route: RouteObject = {
                id: item.id,
                path: getRoutePath(item.path, parent?.path),
                handle: toRouteMeta(item),
            };

            if (currentLazy && !childRoutes.length) {
                route.lazy = currentLazy;
            }

            if (children.length > 0) {
                if (currentLazy) {
                    route.children = [
                        {
                            index: true,
                            lazy: currentLazy,
                        },
                        ...childRoutes,
                    ];
                } else {
                    const firstChild = getFirstVisibleChild(children);
                    if (firstChild?.path) {
                        route.children = [
                            {
                                index: true,
                                element: createNavigateElement(getRoutePath(firstChild.path, item.path)),
                                handle: {
                                    redirectTo: firstChild.path,
                                    parent: item.path,
                                },
                            },
                            ...childRoutes,
                        ];
                    } else {
                        route.children = childRoutes;
                    }
                }
            }

            return route;
        });
};

/**
 * Create Navigate element for default redirects
 */
const createNavigateElement = (to: string): React.ReactElement => {
    return React.createElement(Navigate, { to, replace: true });
};

import type { ReactNode } from "react";
import type { MenuScope } from "./enum";

export interface RouteHandle {
    type?: MenuScope;
    title: string;
    menuKey?: string;
    ActiveMenu?: string;
    hideTitle?: boolean;
    projectDisabled?: boolean;
    tenantDisabled?: boolean;
    hidden?: boolean;
    icon?: ReactNode;
    externalUrl?: string;
    btnList?: Array<{ action_mode: string }>;
    serialNum?: number;
    authMatched?: boolean;
}

export interface RouteConfig {
    id?: string;
    parentId?: string;
    path: string;
    component?: string;
    handle: RouteHandle;
    children?: RouteConfig[];
}

export interface AuthMenu {
    name: string;
    menuKey: string;
    externalUrl?: string;
    serialNum?: number;
    btnList?: Array<{ action_mode: string }>;
}

export interface AuthAppliedMenu extends RouteConfig {
    _order?: number;
}

export type MenuTree<T extends RouteConfig = RouteConfig> = T & {
    children?: MenuTree<T>[];
};

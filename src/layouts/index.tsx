import React from "react";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { sidebarMenuTree } from "@/router/menu";
import logo from "@/assets/logo.png";
import "./index.css";
import type { RouteConfig, RouteHandle } from "@/types/router";

const { Header, Content, Sider } = Layout;

// 顶部导航
const topNavItems: MenuProps["items"] = sidebarMenuTree.map((item) => ({
    key: item.path,
    label: item.handle.title,
    icon: item.handle.icon,
}));

const toSideMenuItems = (items: RouteConfig[] = []): MenuProps["items"] => {
    return items.map((item) => ({
        key: item.path,
        label: item.handle.title,
        icon: item.handle.icon,
        children: item.children?.length ? toSideMenuItems(item.children) : undefined,
    }));
};

const findActiveMenuChain = (items: RouteConfig[] = [], pathname: string, parents: string[] = []): string[] => {
    for (const item of items) {
        const isMatched = pathname === item.path || pathname.startsWith(`${item.path}/`);
        if (!isMatched) continue;

        const chain = [...parents, item.path];
        const childChain = findActiveMenuChain(item.children ?? [], pathname, chain);
        return childChain.length ? childChain : chain;
    }

    return [];
};

const Layouts: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const matches = useMatches();
    const {
        token: { colorBgContainer, borderRadiusLG, colorPrimary, colorPrimaryBg, colorPrimaryBgHover },
    } = theme.useToken();

    const menuThemeVars = {
        "--menu-selected-bg": colorPrimaryBg,
        "--menu-selected-color": colorPrimary,
        "--menu-hover-bg": colorPrimaryBgHover,
    } as React.CSSProperties;

    // 获取当前一级分类路径
    const currentTopPath = "/" + location.pathname.split("/")[1];
    // 获取当前分类的侧边菜单
    const currentMenu = sidebarMenuTree.find((item) => item.path === currentTopPath);
    const sideMenuItems = toSideMenuItems(currentMenu?.children || []);
    const activeChain = findActiveMenuChain(currentMenu?.children || [], location.pathname);
    const selectedSideMenuKey = activeChain.length ? activeChain[activeChain.length - 1] : location.pathname;
    const openSideMenuKeys = activeChain.slice(0, -1);

    const handleTopNavClick: MenuProps["onClick"] = (e) => {
        navigate(e.key);
    };

    const handleSideMenuClick: MenuProps["onClick"] = (e) => {
        navigate(e.key);
    };

    // 构建面包屑数据
    const breadcrumbItems = matches.map((match) => {
        const handle = match.handle as RouteHandle;
        return {
            title: handle?.title,
        };
    });

    return (
        <Layout style={menuThemeVars}>
            <Header className="layout-header" style={{ background: colorBgContainer }}>
                <div className="layout-logo">
                    <img src={logo} alt="logo" className="logo-img" />
                    <span className="logo-text">React Template Admin</span>
                </div>
                <Menu
                    mode="horizontal"
                    selectedKeys={[currentTopPath]}
                    items={topNavItems}
                    onClick={handleTopNavClick}
                    className="layout-top-menu"
                />
            </Header>
            <Layout>
                <Sider width={200} className="border-r border-[#e5e4e7]" style={{ background: colorBgContainer }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedSideMenuKey]}
                        openKeys={openSideMenuKeys}
                        items={sideMenuItems}
                        onClick={handleSideMenuClick}
                        className="layout-side-menu"
                    />
                </Sider>
                <Layout style={{ padding: "0 24px 24px", background: colorBgContainer }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Breadcrumb items={breadcrumbItems} />
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default Layouts;

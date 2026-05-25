import type { ReactNode } from "react";
// 使用了 react-query 进行数据管理，App 组件作为全局状态的提供者，包裹整个应用
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { antdThemeConfig } from "@/theme/antd-theme";

const queryClient = new QueryClient({
    // defaultOptions: {
    //     queries: {
    //         staleTime: 30_000,
    //         refetchInterval: 30_000,
    //     },
    // },
});

function App({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
        </QueryClientProvider>
    );
}

export default App;

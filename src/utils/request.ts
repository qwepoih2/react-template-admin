import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { get } from "radash";
import { message } from "antd";
// import userStore from "@/store/userStore";

type RequestConfig = AxiosRequestConfig & {
    download?: boolean;
    fileName?: string;
    mimeType?: string;
    resPath?: string;
    errorPath?: string;
    showError?: boolean;
    abort?: boolean;
};

interface Result<T = unknown> {
    status: number;
    message: string;
    data: T;
}

type ResultLike = Result<unknown> & {
    success?: boolean;
    code?: number;
    errorMessage?: string;
};

const defaultConfig: Required<
    Pick<RequestConfig, "download" | "fileName" | "mimeType" | "resPath" | "errorPath" | "showError" | "abort">
> = {
    download: false,
    fileName: "",
    mimeType: "",
    resPath: "data",
    errorPath: "data",
    showError: true,
    abort: false,
};

const axiosInstance = axios.create({
    timeout: 90000,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    paramsSerializer: (params) =>
        qs.stringify(params, {
            arrayFormat: "indices",
            allowDots: true,
        }),
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    Object.prototype.toString.call(value) === "[object Object]";

const setHeaders = (headers: Record<string, string>) => {
    headers.tenantId = localStorage.getItem("tenantId") || "";
    headers.projectId = sessionStorage.getItem("projectId") || "";
    const menuKey = sessionStorage.getItem("menuKey") || "";
    if (menuKey) headers.menuKey = menuKey;
};

const normalizeFormData = (config: RequestConfig) => {
    if (
        config.headers?.["content-type"] === "multipart/form-data" &&
        config.data &&
        !(config.data instanceof FormData)
    ) {
        const formData = new FormData();
        Object.entries(config.data as Record<string, unknown>).forEach(([key, value]) => {
            formData.append(key, value as string | Blob);
        });
        config.data = formData;
    }
};

const normalizeUrlencoded = (config: RequestConfig) => {
    if (config.headers?.["content-type"] === "application/x-www-form-urlencoded") {
        config.transformRequest = [
            (data) =>
                Object.entries(data as Record<string, unknown>)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                    .join("&"),
        ];
    }
};

const downloadBlob = (response: AxiosResponse) => {
    const mimeType = (response.config as RequestConfig).mimeType || "application/octet-stream";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const fallbackName = (response.config as RequestConfig).fileName || "download";
    const fileName = disposition?.includes("filename=")
        ? decodeURIComponent(disposition.split("filename=")[1])
        : fallbackName;

    const blob = new Blob([response.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const isSuccessResponse = (data: ResultLike) => data?.success === true || data?.code === 200 || data?.status === 200;

axiosInstance.interceptors.request.use(
    (config) => {
        const cfg = config as RequestConfig;
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer Token";
        setHeaders(config.headers as Record<string, string>);

        normalizeFormData(cfg);
        normalizeUrlencoded(cfg);

        if (cfg.download) {
            config.responseType = "blob";
        }

        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ResultLike>): any => {
        const cfg = response.config as RequestConfig;

        if (cfg.download || response.config.responseType === "blob") {
            downloadBlob(response);
            return response.data;
        }

        const data = response.data;
        if (data && isSuccessResponse(data)) {
            return get(response, cfg.resPath || defaultConfig.resPath);
        }

        const errMsg = data?.message || data?.errorMessage || "请求出错，请稍候重试";
        if (cfg.showError !== false) {
            message.error(errMsg);
        }
        return Promise.reject(get(response, cfg.errorPath || defaultConfig.errorPath) ?? data);
    },
    (error: AxiosError<ResultLike>) => {
        if (error.code === "ECONNABORTED") {
            return Promise.reject({ code: "ECONNABORTED", message: "Request timeout" });
        }

        const cfg = (error.response?.config || error.config) as RequestConfig | undefined;
        const errMsg =
            error.response?.data?.message ||
            error.response?.data?.errorMessage ||
            error.message ||
            "请求出错，请稍候重试";

        if (cfg?.showError !== false) {
            message.error(errMsg);
        }

        if (error.response?.status === 401) {
            // userStore.getState().actions.clearUserInfoAndToken();
        }

        return Promise.reject(error);
    },
);

class APIClient {
    get<T = unknown>(config: RequestConfig): Promise<T> | [Promise<T>, AbortController] {
        return this.request<T>({ ...config, method: "GET" });
    }
    post<T = unknown>(config: RequestConfig): Promise<T> | [Promise<T>, AbortController] {
        return this.request<T>({ ...config, method: "POST" });
    }
    put<T = unknown>(config: RequestConfig): Promise<T> | [Promise<T>, AbortController] {
        return this.request<T>({ ...config, method: "PUT" });
    }
    delete<T = unknown>(config: RequestConfig): Promise<T> | [Promise<T>, AbortController] {
        return this.request<T>({ ...config, method: "DELETE" });
    }

    // 重载 1：如果 abort 是 true，返回数组
    request<T = unknown>(config: RequestConfig & { abort: true }): [Promise<T>, AbortController];
    // 重载 2：如果 abort 是 false 或不存在，返回 Promise
    request<T = unknown>(config: RequestConfig | string): Promise<T>;
    request<T = unknown>(config: RequestConfig | string): Promise<T> | [Promise<T>, AbortController] {
        const mergedConfig: RequestConfig = {
            ...defaultConfig,
            ...(typeof config === "string" ? { url: config } : {}),
            ...(isPlainObject(config) ? config : {}),
        };

        const controller = new AbortController();
        mergedConfig.signal = controller.signal;

        if (mergedConfig.abort) {
            return [axiosInstance.request<any, T>(mergedConfig), controller];
        }

        return axiosInstance.request<any, T>(mergedConfig);
    }
}

export default new APIClient();

import { isRouteErrorResponse, useRouteError } from "react-router";

/**
 * 全局错误边界组件，用于捕获路由错误并展示友好的错误信息
 * @constructor
 */
export default function ErrorBoundary() {
    const error = useRouteError();

    return (
        <div className={rootClassName}>
            <div className={containerClassName}>{renderErrorContent(error)}</div>
        </div>
    );
}

function extractStackInfo(stack?: string) {
    if (!stack) return { filePath: null, functionName: null };

    const filePathMatch = stack.match(/\/src\/[^?]+/);
    const functionNameMatch = stack.match(/at (\S+)/);

    return {
        filePath: filePathMatch ? filePathMatch[0] : null,
        functionName: functionNameMatch ? functionNameMatch[1] : null,
    };
}

function renderErrorContent(error: any) {
    if (isRouteErrorResponse(error)) {
        return (
            <>
                <p>
                    {error.status}: {error.statusText}
                </p>
                <p className={messageClassName}>{error.data}</p>
            </>
        );
    }

    if (error instanceof Error) {
        const { filePath, functionName } = extractStackInfo(error.stack);

        return (
            <>
                <p className={messageClassName}>
                    {error.name}: {error.message}
                </p>
                <pre className={detailsClassName}>{error.stack}</pre>
                {(filePath || functionName) && (
                    <p className={filePathClassName}>
                        {filePath} ({functionName})
                    </p>
                )}
            </>
        );
    }

    return <div>Unknown Error</div>;
}

const rootClassName = "flex min-h-screen flex-1 flex-col items-center bg-neutral-800 px-4 py-[10vh] text-white";
const containerClassName = "flex w-full max-w-4xl flex-col gap-6 rounded-lg bg-neutral-900 p-5";
const messageClassName = "m-0 whitespace-pre-wrap bg-red-950/60 px-4 py-3 font-bold leading-relaxed";
const detailsClassName = "m-0 whitespace-pre-wrap rounded-inherit bg-neutral-950 p-4 leading-relaxed overflow-auto";
const filePathClassName = "mt-4";

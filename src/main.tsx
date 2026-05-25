// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { createRouter } from "@/router/index.tsx";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.tsx";

const root = createRoot(document.getElementById("root")!);
const router = createRouter(App, {
    basename: "/abc",
});

root.render(<RouterProvider router={router} />);

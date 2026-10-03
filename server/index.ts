import { handleApi, type ModelEnvironment } from "../lib/server-api.ts";
import assets from "./assets.js";
const mime: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json",
  txt: "text/plain; charset=utf-8",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  png: "image/png",
  woff2: "font/woff2",
};
const worker = {
  async fetch(request: Request, env: ModelEnvironment) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("不支持此请求", { status: 405 });
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      return new Response("路径无效", { status: 400 });
    }
    // A new asset prefix avoids reusing browser caches from the broken release.
    path = path.replace(/^\/assets\/v0\.2\.[12](?=\/_next\/static\/)/, "");
    if (path.endsWith("/")) path += "index.html";
    let entry = assets[path];
    if (!entry && !path.includes(".")) entry = assets[path + "/index.html"];
    const found = !!entry;
    entry = entry || assets["/404.html"];
    if (!entry) return new Response("页面不存在", { status: 404 });
    const bytes = Uint8Array.from(atob(entry), (c) => c.charCodeAt(0));
    const ext = found
      ? path.includes(".")
        ? path.split(".").pop()
        : "html"
      : "html";
    // Sites may normalize response encoding headers. Keep compression internal
    // to the asset bundle and send decoded bytes over the response boundary.
    const body = request.method === "HEAD" ? null :
      new Response(bytes).body!.pipeThrough(new DecompressionStream("gzip"));
    return new Response(body, {
      status: found ? 200 : 404,
      headers: {
        "content-type": mime[ext || "html"] || "application/octet-stream",
        "cache-control": "no-cache",
        "x-content-type-options": "nosniff",
        "referrer-policy": "same-origin",
      },
    });
  },
};

export default worker;

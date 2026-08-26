#!/usr/bin/env python3
"""YunKan-OpenVINO UI — static files + same-origin reverse proxy to the API."""

from __future__ import annotations

import argparse
import http.client
import os
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent / "public"
DEFAULT_API = os.environ.get("YUNKAN_API", os.environ.get("SKYVIEW_API", "http://127.0.0.1:23326"))
DEFAULT_MEDIA = os.environ.get("YUNKAN_MEDIA", "http://127.0.0.1:23406")
API_PREFIXES = ("/api/", "/healthz")
MEDIA_PREFIXES = ("/live/", "/detect/", "/index/")
MEDIA_EXTS = (".m3u8", ".ts", ".flv", ".mp4")
HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
}


class Handler(SimpleHTTPRequestHandler):
    api_base = DEFAULT_API
    media_base = DEFAULT_MEDIA

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_OPTIONS(self):
        if self._is_api():
            self._proxy()
        else:
            self.send_response(204)
            self.end_headers()

    def do_GET(self):
        if self._is_api():
            self._proxy()
            return
        path = urlsplit(self.path).path
        if path == "/favicon.ico":
            self.path = "/favicon.svg"
            return SimpleHTTPRequestHandler.do_GET(self)
        full = ROOT / path.lstrip("/")
        if path == "/" or not full.exists() or full.is_dir():
            self.path = "/index.html"
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        self._proxy()

    def do_PUT(self):
        self._proxy()

    def do_PATCH(self):
        self._proxy()

    def do_DELETE(self):
        self._proxy()

    def _is_api(self) -> bool:
        path = urlsplit(self.path).path
        if path == "/healthz" or path.startswith(API_PREFIXES) or path.startswith(MEDIA_PREFIXES):
            return True
        lower = path.lower()
        return any(lower.endswith(ext) for ext in MEDIA_EXTS)

    def _proxy_base(self):
        path = urlsplit(self.path).path
        if path == "/healthz" or path.startswith("/api/"):
            return self.api_base
        return self.media_base

    def _cookie(self, name: str) -> str:
        raw = self.headers.get("Cookie") or ""
        for part in raw.split(";"):
            k, _, v = part.strip().partition("=")
            if k == name:
                return v
        return ""

    def _proxy(self):
        api = urlsplit(self._proxy_base())
        host, port = api.hostname, api.port or (443 if api.scheme == "https" else 80)
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP}
        headers["Host"] = f"{host}:{port}" if port not in (80, 443) else host
        if not any(k.lower() == "authorization" for k in headers):
            tok = self._cookie("yunkan_auth")
            if tok:
                headers["Authorization"] = f"Bearer {unquote(tok)}"
        try:
            conn_cls = http.client.HTTPSConnection if api.scheme == "https" else http.client.HTTPConnection
            conn = conn_cls(host, port, timeout=300)
            conn.request(self.command, self.path, body=body, headers=headers)
            resp = conn.getresponse()
        except Exception as exc:
            msg = f'{{"code":502,"data":null,"message":"API 代理失败: {exc}"}}'.encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)
            return

        self.send_response(resp.status)
        for k, v in resp.getheaders():
            if k.lower() in HOP:
                continue
            self.send_header(k, v)
        self.send_header("Connection", "close")
        self.end_headers()
        try:
            while True:
                chunk = resp.read(64 * 1024)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            conn.close()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    p = argparse.ArgumentParser(description="YunKan-OpenVINO UI")
    p.add_argument("--api", default=DEFAULT_API, help="后端 API 地址")
    p.add_argument("--media", default=DEFAULT_MEDIA, help="原 UI / 媒体代理（HLS）")
    p.add_argument("--host", default="0.0.0.0")
    p.add_argument("--port", type=int, default=int(os.environ.get("PORT", "18081")))
    p.add_argument("--open", action="store_true", help="启动后打开浏览器")
    args = p.parse_args()
    if not ROOT.exists():
        sys.exit(f"missing {ROOT}")
    Handler.api_base = args.api.rstrip("/")
    Handler.media_base = args.media.rstrip("/")
    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    url = f"http://127.0.0.1:{args.port}"
    print(f"YunKan-OpenVINO  {url}")
    print(f"Preview          {url}/?demo=1")
    print(f"API proxy        {Handler.api_base}")
    print(f"Media proxy      {Handler.media_base}")
    print("Ctrl+C 退出。")
    if args.open:
        webbrowser.open(f"{url}/?demo=1")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()

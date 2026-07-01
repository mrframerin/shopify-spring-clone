#!/usr/bin/env python3
"""Local server for Shopify Spring 2026 clone.
Run: python3 server.py
Open: http://localhost:3001/ca/editions/spring2026
"""
import http.server, socketserver, os, urllib.parse, json, hashlib, urllib.request

PORT = int(os.environ.get("PORT", "3001"))
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(ROOT, "api-cache")
UPSTREAM = "https://www.shopify.com"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

MIME = {
    ".js":    "application/javascript; charset=utf-8",
    ".mjs":   "application/javascript; charset=utf-8",
    ".css":   "text/css; charset=utf-8",
    ".html":  "text/html; charset=utf-8",
    ".json":  "application/json",
    ".png":   "image/png",
    ".webp":  "image/webp",
    ".woff2": "font/woff2",
    ".woff":  "font/woff",
    ".svg":   "image/svg+xml",
    ".ico":   "image/x-icon",
    ".ktx2":  "image/ktx2",
    ".glb":   "model/gltf-binary",
    ".mp4":   "video/mp4",
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        code = str(args[1]) if len(args) > 1 else "?"
        if code.startswith(("4", "5")):
            print(f"  {code} {args[0]}")

    def send_file(self, path, content_type):
        try:
            with open(path, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self.send_error(404, f"Not found: {path}")

    def send_json(self, obj, status=200):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def is_api(self, path):
        # The app's own JSON endpoints. These return real data (proxied + cached),
        # never the SSR HTML — otherwise the client crashes into its 500 page.
        return "/api/" in path

    def serve_api(self):
        """Return the real API JSON for this request, proxied from the live site
        and cached to disk. Falls back to {} if the upstream can't be reached."""
        full = self.path  # includes querystring
        key = hashlib.sha1(full.encode("utf-8")).hexdigest()
        cache_file = os.path.join(CACHE_DIR, key + ".json")

        if os.path.isfile(cache_file):
            with open(cache_file, "rb") as f:
                self._raw_json(f.read())
            return

        try:
            req = urllib.request.Request(
                UPSTREAM + full,
                headers={"User-Agent": UA, "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read()
            os.makedirs(CACHE_DIR, exist_ok=True)
            with open(cache_file, "wb") as f:
                f.write(body)
            self._raw_json(body)
        except Exception as e:
            print(f"  [api proxy fail] {full}: {e}")
            self._raw_json(b"{}")

    def _raw_json(self, body):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        rel = path.lstrip("/")

        if rel.startswith("assets/"):
            filename = rel[len("assets/"):]
            ext = os.path.splitext(filename)[1].lower()
            self.send_file(
                os.path.join(ROOT, "assets", filename),
                MIME.get(ext, "application/octet-stream")
            )
        elif self.is_api(path):
            self.serve_api()
        elif path == "/" or path == "":
            self.send_response(302)
            self.send_header("Location", "/ca/editions/spring2026")
            self.end_headers()
        else:
            self.send_file(os.path.join(ROOT, "index.html"), "text/html; charset=utf-8")

    def do_POST(self):
        # The app posts a few analytics/telemetry beacons; ack them with empty JSON.
        self.send_json({})

    def do_HEAD(self):
        self.do_GET()


if __name__ == "__main__":
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n  Shopify Spring '26 Clone")
        print(f"  ========================")
        print(f"  Open: http://localhost:{PORT}/ca/editions/spring2026")
        print(f"\n  Press Ctrl+C to stop\n")
        httpd.serve_forever()

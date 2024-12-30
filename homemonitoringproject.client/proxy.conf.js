const PROXY_CONFIG = [
  {
    context: [
      "/api",
    ],
    target: "https://localhost:7187/",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY LOG] Proxying request: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[PROXY LOG] Received response for: ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] Error for request: ${req.url}`, err);
    }
  }
]

module.exports = PROXY_CONFIG;

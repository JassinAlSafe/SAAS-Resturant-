const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const url = require("url");

const app = express();

// Enable CORS
app.use(cors());

// Image proxy middleware
app.get("/api/image-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).send("Missing URL parameter");
    }

    // Parse the URL to extract the protocol, hostname, and path
    const parsedUrl = url.parse(imageUrl);

    // Create a proxy for this specific request
    const proxy = createProxyMiddleware({
      target: `${parsedUrl.protocol}//${parsedUrl.host}`,
      changeOrigin: true,
      pathRewrite: (path) => parsedUrl.path,
      onProxyRes: (proxyRes, req, res) => {
        // Add caching headers
        proxyRes.headers["Cache-Control"] = "public, max-age=86400"; // 24 hours
      },
    });

    // Handle the proxy request
    proxy(req, res, (err) => {
      if (err) {
        console.error("Proxy error:", err);
        return res.status(500).send("Proxy error");
      }
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).send("Server error");
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).send("Image proxy server is running");
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Image proxy server is running on http://localhost:${PORT}`);
});

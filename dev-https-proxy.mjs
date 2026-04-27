import { createServer } from "https";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import httpProxy from "http-proxy";

const certDir = "./certificates";
const keyPath = `${certDir}/key.pem`;
const certPath = `${certDir}/cert.pem`;

if (!existsSync(certDir)) mkdirSync(certDir);

if (!existsSync(keyPath) || !existsSync(certPath)) {
  console.log("Generating self-signed certificate...");
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`,
    { stdio: "inherit" }
  );
}

const proxy = httpProxy.createProxyServer({ target: "http://localhost:3333", ws: true });

const server = createServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath) },
  (req, res) => proxy.web(req, res)
);

server.on("upgrade", (req, socket, head) => proxy.ws(req, socket, head));

server.listen(3334, "0.0.0.0", () => {
  console.log("\n✅ HTTPS proxy running at https://0.0.0.0:3334");
  console.log("Open on iPad: https://<your-pc-ip>:3334\n");
});

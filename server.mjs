import { createServer } from "https";
import { readFileSync } from "fs";
import { parse } from "url";
import next from "next";

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: readFileSync("./certificates/key.pem"),
      cert: readFileSync("./certificates/cert.pem"),
    },
    (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }
  ).listen(3334, "0.0.0.0", () => {
    console.log("\n✅ HTTPS dev server running at https://0.0.0.0:3334\n");
  });
});

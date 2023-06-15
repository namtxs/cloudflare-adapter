import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import workers from "./src/adapter/workers.js";
import hello from "./workers/hello.js";
import origin from "./workers/origin.js";

process.on("uncaughtException", function (err) {
  console.error("Caught exception: " + err);
});

dotenv.config();

const app = express();
app.port = process.env.PORT || 8989;

app.get("/", (req, res) => {
  workers(hello, req, res);
});

app.all(
  /\/proxy/,
  express.raw({
    inflate: true,
    limit: "50mb",
    type: () => true,
  }),
  async (req, res) => {
    const urls = req.url.replace("/proxy?url=", "");
    const originUrl = decodeURIComponent(urls);
    workers(origin, req, res, { fetch: fetch, url: originUrl });
  }
);

app.listen(app.port, () => {
  console.log(`Listening on port ${app.port}`);
});

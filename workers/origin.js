import readRequestBody from "../src/handler/readRequestBody.js";

const allowHeaders = [
  "Accept-Encoding",
  "Accept-Language",
  "Accept",
  "Access-Control-Allow-Origin",
  "Authorization",
  "Cache-Control",
  "Content-Length",
  "Content-Type",
  "DNT",
  "Git-Protocol",
  "Pragma",
  "Range",
  "Referer",
  "User-Agent",
  "X-Authorization",
  "X-Http-Method-Override",
  "X-Requested-With",
];
const exposeHeaders = [
  "Accept-Ranges",
  "Age",
  "Cache-Control",
  "Content-Length",
  "Content-Language",
  "Content-Type",
  "Date",
  "Etag",
  "Expires",
  "Last-Modified",
  "Location",
  "Pragma",
  "Server",
  "Transfer-Encoding",
  "Vary",
  "X-Github-Request-ID",
  "X-Redirected-URL",
];
const allowMethods = ["POST", "GET", "OPTIONS"];
function logEntries(iterator) {
  let string = "";
  for (const [key, value] of iterator) {
    string += `${key}: ${value}
  `;
  }
  return string;
}
export default {
  async fetch(req, env) {
    let headers = new Headers();
    //console.log(env.url);
    let urls = new URL(env.url);
    let proxyUrl = urls;
    req.headers.forEach((value, key) => {
      headers.append(key.toLowerCase(), value);
    });
    const host = new URL(proxyUrl).host;
    headers.delete("referer");
    headers.delete("host");
    headers.append("host", host);
    headers.append("referer", "https://www.bilibili.tv");
    console.log(
      "=> REQ HEADERS : \n\n" + logEntries(headers.entries()) + "\n\n"
    );
    let res = null;
    if (req.method == "OPTIONS") {
      res = new Response();
    } else {
      var f;
      if (env && env.fetch) {
        f = await env.fetch(proxyUrl, {
          compress: false,
          method: req.method,
          headers,
          body:
            req.method !== "GET" && req.method !== "HEAD"
              ? await readRequestBody(req)
              : undefined,
        });
      } else {
        f = await fetch(proxyUrl, {
          method: req.method,
          headers,
          body:
            req.method !== "GET" && req.method !== "HEAD"
              ? await readRequestBody(req)
              : undefined,
        });
      }
      // Recreate the response so you can modify the headers
      res = new Response(f.body, f);
      res.statusCode = f.status;
      // Set headers
      for (let h of exposeHeaders) {
        if (h === "content-length") continue;
        if (f.headers.has(h)) {
          res.headers.set(h, f.headers.get(h));
        }
      }
      if (f.redirected) {
        res.headers.set("x-redirected-url", f.url);
      }
      // Append to/Add Vary header so browser will cache response correctly
    }
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    res.headers.set("Access-Control-Max-Age", "86400");
    console.log(
      "=> RES HEADERS : \n\n" + logEntries(res.headers.entries()) + "\n\n"
    );
    return res;
  },
};

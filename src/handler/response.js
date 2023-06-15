import { pipeline } from "stream/promises";

export default async function (oResponse, res) {
  const headersHash = {};
  for (let [key, value] of oResponse.headers) {
    headersHash[key] = value;
  }
  res.set(headersHash);
  res.status(oResponse.statusCode || oResponse.status);
  if (oResponse.body) {
    try {
      await pipeline(oResponse.body, res);
      res.on("finish", () => {
        res.end();
      });
    } catch (err) {
      console.log(`Error during streaming: ${err.message}`);
      res.end();
    }
  } else {
    res.end();
  }
}

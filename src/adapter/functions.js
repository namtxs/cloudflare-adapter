import request from "../handler/request.js";
import response from "../handler/response.js";
export default async function (delegate, req, res, env) {
  const context = { request: request(req), env };
  response(await delegate(context), res);
}

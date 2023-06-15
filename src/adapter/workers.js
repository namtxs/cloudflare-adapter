import request from "../handler/request.js";
import response from "../handler/response.js";
export default async function (delegate, req, res, env) {
  response(await delegate.fetch(request(req), env), res);
}

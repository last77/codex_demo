import { sendFail } from "../utils/response.js";

export function notFoundHandler(req, res) {
  return sendFail(res, "接口不存在", 404, 404);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const code = err.code || 500;
  const message = err.message || "服务器错误";
  return sendFail(res, message, code, status);
}


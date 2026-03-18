export function sendSuccess(res, data = null, message = "ok") {
  return res.json({
    code: 0,
    message,
    data
  });
}

export function sendFail(res, message = "请求失败", code = 1, status = 400, data = null) {
  return res.status(status).json({
    code,
    message,
    data
  });
}


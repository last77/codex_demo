import axios from "axios";

const http = axios.create({
  baseURL: "/api",
  timeout: 10000
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data || {};
    if (payload.code !== 0) {
      return Promise.reject(new Error(payload.message || "请求失败"));
    }
    return payload.data;
  },
  (error) => {
    const message = error?.response?.data?.message || error.message || "网络错误";
    return Promise.reject(new Error(message));
  }
);

export default http;


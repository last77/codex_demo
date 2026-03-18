import http from "./http";

export function fetchProducts(params = {}) {
  return http.get("/products", { params });
}


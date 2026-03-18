import http from "./http";

const DEMO_USER_ID = 1;

export function fetchCart(userId = DEMO_USER_ID) {
  return http.get("/cart", { params: { userId } });
}

export function addCartItem({ userId = DEMO_USER_ID, productId, quantity }) {
  return http.post("/cart/items", {
    userId,
    productId,
    quantity
  });
}

export function updateCartItem(itemId, quantity) {
  return http.patch(`/cart/items/${itemId}`, { quantity });
}

export function deleteCartItem(itemId) {
  return http.delete(`/cart/items/${itemId}`);
}


import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { addCartItem, deleteCartItem, fetchCart, updateCartItem } from "../api/cart";

export const useCartStore = defineStore("cart", () => {
  const userId = 1;
  const items = ref([]);
  const totalCount = ref(0);
  const totalPrice = ref(0);
  const loading = ref(false);

  const isEmpty = computed(() => items.value.length === 0);

  function applyCartData(cartData) {
    items.value = cartData?.items || [];
    totalCount.value = Number(cartData?.summary?.totalCount || 0);
    totalPrice.value = Number(cartData?.summary?.totalPrice || 0);
  }

  async function fetchCartData() {
    loading.value = true;
    try {
      const data = await fetchCart(userId);
      applyCartData(data);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function addItem(productId, quantity = 1) {
    const data = await addCartItem({
      userId,
      productId,
      quantity
    });
    applyCartData(data);
    return data;
  }

  async function updateItemQuantity(itemId, quantity) {
    const data = await updateCartItem(itemId, quantity);
    applyCartData(data);
    return data;
  }

  async function removeItem(itemId) {
    const data = await deleteCartItem(itemId);
    applyCartData(data);
    return data;
  }

  return {
    items,
    totalCount,
    totalPrice,
    loading,
    isEmpty,
    fetchCart: fetchCartData,
    addItem,
    updateItemQuantity,
    removeItem
  };
});


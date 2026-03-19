<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { fetchProducts } from "../api/products";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const products = ref([]);
const loading = ref(false);
const error = ref("");
const tip = ref("");
const quantityMap = ref({});
const addingMap = ref({});
let tipTimer = 0;

function updateQty(productId, stock) {
  const current = Number(quantityMap.value[productId] || 1);
  const upperBound = Math.max(1, Number(stock) || 1);
  const clamped = Math.min(Math.max(Math.trunc(current) || 1, 1), upperBound);
  quantityMap.value[productId] = clamped;
}

function getQty(productId, stock) {
  const value = Number(quantityMap.value[productId] || 1);
  if (!Number.isInteger(value) || value < 1) {
    return 1;
  }
  return Math.min(value, Math.max(1, Number(stock) || 1));
}

async function loadProducts() {
  loading.value = true;
  error.value = "";
  try {
    const data = await fetchProducts();
    products.value = Array.isArray(data) ? data : data.list || [];
    const map = {};
    for (const product of products.value) {
      map[product.id] = 1;
    }
    quantityMap.value = map;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function handleAddToCart(product) {
  if (product.stock <= 0 || addingMap.value[product.id]) {
    return;
  }
  const quantity = getQty(product.id, product.stock);
  addingMap.value = { ...addingMap.value, [product.id]: true };
  try {
    await cartStore.addItem(product.id, quantity);
    tip.value = `已加入购物车：${product.name} x ${quantity}`;
    if (tipTimer) {
      clearTimeout(tipTimer);
    }
    tipTimer = window.setTimeout(() => {
      tip.value = "";
    }, 1600);
  } catch (err) {
    alert(err.message);
  } finally {
    addingMap.value = { ...addingMap.value, [product.id]: false };
  }
}

onMounted(loadProducts);
onBeforeUnmount(() => {
  if (tipTimer) {
    clearTimeout(tipTimer);
  }
});
</script>

<template>
  <section class="container page-section">
    <div class="page-heading">
      <div>
        <p class="eyebrow">精选上新</p>
        <h2 class="page-title">商品列表</h2>
      </div>
      <p v-if="!loading && !error" class="page-stat">共 {{ products.length }} 件商品</p>
    </div>

    <p v-if="tip" class="tip" role="status">{{ tip }}</p>
    <p v-if="loading" class="muted-text">正在加载商品...</p>
    <p v-if="error" class="error-text" role="alert">{{ error }}</p>

    <div v-if="loading" class="product-grid skeleton-grid" aria-hidden="true">
      <article v-for="n in 8" :key="n" class="product-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </article>
    </div>

    <div v-if="!loading && !error && products.length === 0" class="empty-box">当前暂无商品，稍后再来看看。</div>

    <div v-if="!loading && !error && products.length > 0" class="product-grid">
      <article v-for="product in products" :key="product.id" class="product-card">
        <img class="product-image" :src="product.imageUrl" :alt="product.name" />
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-subtitle">{{ product.subtitle }}</p>
        <p class="product-meta">
          <span class="meta-pill">{{ product.category }}</span>
          <span>月销 {{ product.sales }}</span>
        </p>
        <p class="product-price">¥ {{ Number(product.price).toFixed(2) }}</p>
        <p class="product-stock" :class="{ 'is-out': product.stock <= 0 }">库存：{{ product.stock }}</p>

        <div class="action-row">
          <label class="visually-hidden" :for="`qty-${product.id}`">购买数量</label>
          <input
            :id="`qty-${product.id}`"
            v-model.number="quantityMap[product.id]"
            class="qty-input"
            type="number"
            min="1"
            :max="product.stock"
            :aria-label="`${product.name} 购买数量`"
            @input="updateQty(product.id, product.stock)"
            @blur="updateQty(product.id, product.stock)"
          />
          <button
            class="btn-primary"
            :disabled="product.stock <= 0 || !!addingMap[product.id]"
            :aria-label="`加入购物车：${product.name}`"
            @click="handleAddToCart(product)"
          >
            <span v-if="product.stock <= 0">暂时缺货</span>
            <span v-else-if="addingMap[product.id]">加入中...</span>
            <span v-else>加入购物车</span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

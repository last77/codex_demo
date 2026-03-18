<script setup>
import { onMounted, ref } from "vue";
import { fetchProducts } from "../api/products";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const products = ref([]);
const loading = ref(false);
const error = ref("");
const tip = ref("");
const quantityMap = ref({});

function getQty(productId) {
  const value = Number(quantityMap.value[productId] || 1);
  return Number.isInteger(value) && value > 0 ? value : 1;
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
  const quantity = getQty(product.id);
  try {
    await cartStore.addItem(product.id, quantity);
    tip.value = `已加入购物车：${product.name} x ${quantity}`;
    setTimeout(() => {
      tip.value = "";
    }, 1600);
  } catch (err) {
    alert(err.message);
  }
}

onMounted(loadProducts);
</script>

<template>
  <section class="container page-section">
    <h2 class="page-title">商品列表</h2>
    <p v-if="tip" class="tip">{{ tip }}</p>
    <p v-if="loading">商品加载中...</p>
    <p v-if="error" class="error-text">{{ error }}</p>

    <div v-if="!loading && !error" class="product-grid">
      <article v-for="product in products" :key="product.id" class="product-card">
        <img class="product-image" :src="product.imageUrl" :alt="product.name" />
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-subtitle">{{ product.subtitle }}</p>
        <p class="product-meta">
          分类：{{ product.category }} | 销量：{{ product.sales }}
        </p>
        <p class="product-price">¥ {{ Number(product.price).toFixed(2) }}</p>
        <p class="product-stock">库存：{{ product.stock }}</p>

        <div class="action-row">
          <input
            v-model.number="quantityMap[product.id]"
            class="qty-input"
            type="number"
            min="1"
            :max="product.stock"
          />
          <button class="btn-primary" :disabled="product.stock <= 0" @click="handleAddToCart(product)">
            加入购物车
          </button>
        </div>
      </article>
    </div>
  </section>
</template>


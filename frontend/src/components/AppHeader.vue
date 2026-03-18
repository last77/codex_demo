<script setup>
import { useRoute } from "vue-router";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const cartStore = useCartStore();
</script>

<template>
  <header class="site-header">
    <div class="container header-content">
      <h1 class="logo">简易商城</h1>
      <nav class="nav-links">
        <RouterLink class="nav-link" :class="{ active: route.path === '/products' }" to="/products">
          商品列表
        </RouterLink>
        <RouterLink class="nav-link cart-link" :class="{ active: route.path === '/cart' }" to="/cart">
          购物车
          <span class="badge">{{ cartStore.totalCount }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>


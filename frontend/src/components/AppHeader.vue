<script setup>
import { useRoute } from "vue-router";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const cartStore = useCartStore();
</script>

<template>
  <header class="site-header">
    <div class="container header-content">
      <RouterLink class="brand" to="/products" aria-label="前往商品列表首页">
        <p class="brand-kicker">Green Cart Lab</p>
        <h1 class="logo">简易商城</h1>
      </RouterLink>
      <nav class="nav-links" aria-label="主导航">
        <RouterLink class="nav-link" :class="{ active: route.path === '/products' }" to="/products">
          商品列表
        </RouterLink>
        <RouterLink class="nav-link cart-link" :class="{ active: route.path === '/cart' }" to="/cart">
          购物车
          <span class="badge" aria-label="购物车商品数量">{{ cartStore.totalCount }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

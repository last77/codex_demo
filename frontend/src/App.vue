<script setup>
import { onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import { useCartStore } from "./stores/cart";

const cartStore = useCartStore();

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="page-main">
      <RouterView />
    </main>
  </div>
</template>


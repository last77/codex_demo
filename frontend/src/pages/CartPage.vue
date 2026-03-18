<script setup>
import { onMounted, ref } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const error = ref("");

async function loadCart() {
  error.value = "";
  try {
    await cartStore.fetchCart();
  } catch (err) {
    error.value = err.message;
  }
}

async function increase(item) {
  const nextQty = item.quantity + 1;
  if (nextQty > item.stock) {
    alert("不能超过库存");
    return;
  }
  try {
    await cartStore.updateItemQuantity(item.id, nextQty);
  } catch (err) {
    alert(err.message);
  }
}

async function decrease(item) {
  const nextQty = item.quantity - 1;
  if (nextQty < 1) {
    return;
  }
  try {
    await cartStore.updateItemQuantity(item.id, nextQty);
  } catch (err) {
    alert(err.message);
  }
}

async function remove(item) {
  try {
    await cartStore.removeItem(item.id);
  } catch (err) {
    alert(err.message);
  }
}

onMounted(loadCart);
</script>

<template>
  <section class="container page-section">
    <h2 class="page-title">购物车</h2>
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-if="cartStore.loading">购物车加载中...</p>

    <div v-if="!cartStore.loading && cartStore.isEmpty" class="empty-box">购物车为空，去商品页添加吧。</div>

    <div v-if="!cartStore.loading && !cartStore.isEmpty" class="cart-panel">
      <table class="cart-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>单价</th>
            <th>数量</th>
            <th>小计</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartStore.items" :key="item.id">
            <td>
              <div class="cart-product">
                <img :src="item.imageUrl" :alt="item.name" />
                <div>
                  <p class="cart-product-name">{{ item.name }}</p>
                  <p class="cart-product-subtitle">{{ item.subtitle }}</p>
                </div>
              </div>
            </td>
            <td>¥ {{ Number(item.price).toFixed(2) }}</td>
            <td>
              <div class="qty-row">
                <button class="qty-btn" @click="decrease(item)">-</button>
                <span>{{ item.quantity }}</span>
                <button class="qty-btn" @click="increase(item)">+</button>
              </div>
            </td>
            <td>¥ {{ Number(item.subtotal).toFixed(2) }}</td>
            <td>
              <button class="btn-danger" @click="remove(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="cart-summary">
        <span>总件数：{{ cartStore.totalCount }}</span>
        <span>总价：¥ {{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
    </div>
  </section>
</template>


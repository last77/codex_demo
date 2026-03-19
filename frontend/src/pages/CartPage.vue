<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
const error = ref("");
const notice = ref("");
const noticeType = ref("info");
const updatingId = ref(null);
let noticeTimer = 0;

function showNotice(message, type = "info") {
  notice.value = message;
  noticeType.value = type;
  if (noticeTimer) {
    clearTimeout(noticeTimer);
  }
  noticeTimer = window.setTimeout(() => {
    notice.value = "";
  }, 1800);
}

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
    showNotice("不能超过库存上限", "warn");
    return;
  }
  updatingId.value = item.id;
  try {
    await cartStore.updateItemQuantity(item.id, nextQty);
    showNotice(`已调整数量：${item.name} x ${nextQty}`);
  } catch (err) {
    showNotice(err.message, "error");
  } finally {
    updatingId.value = null;
  }
}

async function decrease(item) {
  const nextQty = item.quantity - 1;
  if (nextQty < 1) {
    return;
  }
  updatingId.value = item.id;
  try {
    await cartStore.updateItemQuantity(item.id, nextQty);
    showNotice(`已调整数量：${item.name} x ${nextQty}`);
  } catch (err) {
    showNotice(err.message, "error");
  } finally {
    updatingId.value = null;
  }
}

async function remove(item) {
  if (!window.confirm(`确定删除「${item.name}」吗？`)) {
    return;
  }
  updatingId.value = item.id;
  try {
    await cartStore.removeItem(item.id);
    showNotice(`已删除：${item.name}`);
  } catch (err) {
    showNotice(err.message, "error");
  } finally {
    updatingId.value = null;
  }
}

onMounted(loadCart);
onBeforeUnmount(() => {
  if (noticeTimer) {
    clearTimeout(noticeTimer);
  }
});
</script>

<template>
  <section class="container page-section">
    <div class="page-heading">
      <div>
        <p class="eyebrow">我的清单</p>
        <h2 class="page-title">购物车</h2>
      </div>
      <p v-if="!cartStore.loading && !cartStore.isEmpty" class="page-stat">共 {{ cartStore.totalCount }} 件商品</p>
    </div>

    <p v-if="notice" class="tip" :class="`is-${noticeType}`" role="status">{{ notice }}</p>
    <p v-if="error" class="error-text" role="alert">{{ error }}</p>
    <p v-if="cartStore.loading" class="muted-text">购物车加载中...</p>

    <div v-if="!cartStore.loading && cartStore.isEmpty" class="empty-box">
      <p>购物车还是空的，先去挑几件喜欢的商品吧。</p>
      <RouterLink class="btn-secondary" to="/products">去逛商品</RouterLink>
    </div>

    <div v-if="!cartStore.loading && !cartStore.isEmpty" class="cart-panel">
      <div class="cart-table-wrap">
        <table class="cart-table">
          <caption class="visually-hidden">购物车商品清单</caption>
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
                  <button
                    class="qty-btn"
                    :disabled="updatingId === item.id || item.quantity <= 1"
                    :aria-label="`减少 ${item.name} 数量`"
                    @click="decrease(item)"
                  >
                    -
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button
                    class="qty-btn"
                    :disabled="updatingId === item.id || item.quantity >= item.stock"
                    :aria-label="`增加 ${item.name} 数量`"
                    @click="increase(item)"
                  >
                    +
                  </button>
                </div>
              </td>
              <td>¥ {{ Number(item.subtotal).toFixed(2) }}</td>
              <td>
                <button class="btn-danger" :disabled="updatingId === item.id" @click="remove(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cart-summary">
        <p>总件数：{{ cartStore.totalCount }}</p>
        <p>总价：¥ {{ cartStore.totalPrice.toFixed(2) }}</p>
      </div>
    </div>
  </section>
</template>

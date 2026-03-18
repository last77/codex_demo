import { createRouter, createWebHistory } from "vue-router";
import ProductListPage from "../pages/ProductListPage.vue";
import CartPage from "../pages/CartPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/products"
  },
  {
    path: "/products",
    name: "products",
    component: ProductListPage
  },
  {
    path: "/cart",
    name: "cart",
    component: CartPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;


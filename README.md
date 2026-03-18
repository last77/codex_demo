# 简易 PC 商城（Vue3 + Express + MySQL）

本项目是一个前后端分离的最小商城示例，包含两个页面：

- 商品列表页
- 购物车页（固定用户 `user_id=1`）

数据来自 MySQL，购物车支持增减删和总价计算。

## 目录结构

```text
.
├─ backend              # Node.js + Express + mysql2
├─ frontend             # Vue3 + Vite + Pinia + Vue Router
└─ sql
   └─ init.sql          # 建表与种子数据
```

## 1) 初始化数据库

请先确保本地 MySQL 已启动，然后在项目根目录执行：

```bash
mysql -u root -p < sql/init.sql
```

脚本会创建数据库 `pc_mall`，并写入：

- 1 条演示用户（`id=1`）
- 12 条商品数据

## 2) 启动后端

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

默认端口：`3000`

## 3) 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认端口：`5173`，并通过 Vite 代理转发 `/api` 到后端。

## 4) API 概览

- `GET /api/products`：商品列表（支持分页参数 `page`、`pageSize`）
- `GET /api/cart?userId=1`：查询购物车
- `POST /api/cart/items`：加入购物车
- `PATCH /api/cart/items/:itemId`：更新购物车项数量
- `DELETE /api/cart/items/:itemId`：删除购物车项

统一响应结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

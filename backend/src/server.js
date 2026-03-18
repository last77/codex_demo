import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import { sendFail, sendSuccess } from "./utils/response.js";
import { getCartDetail } from "./utils/cart.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());

function toPositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

async function validateUser(userId) {
  const [rows] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows.length > 0;
}

async function getProductById(productId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, price, stock
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
    [productId]
  );
  return rows[0] || null;
}

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    return sendSuccess(res, { db: "ok" });
  } catch (err) {
    return next(err);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const page = req.query.page ? toPositiveInt(req.query.page) : null;
    const pageSize = req.query.pageSize ? toPositiveInt(req.query.pageSize) : null;

    if ((req.query.page && !page) || (req.query.pageSize && !pageSize)) {
      return sendFail(res, "page 和 pageSize 必须是正整数");
    }

    if (page && pageSize) {
      const offset = (page - 1) * pageSize;
      const [rows] = await pool.query(
        `
        SELECT id, name, subtitle, price, stock, image_url AS imageUrl, category, sales
        FROM products
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [pageSize, offset]
      );
      const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM products");
      const total = Number(countRows[0].total);

      return sendSuccess(res, {
        list: rows.map((item) => ({
          ...item,
          price: Number(item.price),
          stock: Number(item.stock),
          sales: Number(item.sales)
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    }

    const [rows] = await pool.query(
      `
      SELECT id, name, subtitle, price, stock, image_url AS imageUrl, category, sales
      FROM products
      ORDER BY id DESC
      `
    );
    return sendSuccess(
      res,
      rows.map((item) => ({
        ...item,
        price: Number(item.price),
        stock: Number(item.stock),
        sales: Number(item.sales)
      }))
    );
  } catch (err) {
    return next(err);
  }
});

app.get("/api/cart", async (req, res, next) => {
  try {
    const userId = toPositiveInt(req.query.userId);
    if (!userId) {
      return sendFail(res, "userId 必填且必须是正整数");
    }

    const exists = await validateUser(userId);
    if (!exists) {
      return sendFail(res, "用户不存在", 404, 404);
    }

    const cart = await getCartDetail(userId);
    return sendSuccess(res, cart);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/cart/items", async (req, res, next) => {
  try {
    const userId = toPositiveInt(req.body.userId);
    const productId = toPositiveInt(req.body.productId);
    const quantity = toPositiveInt(req.body.quantity);

    if (!userId || !productId || !quantity) {
      return sendFail(res, "userId、productId、quantity 必填且必须是正整数");
    }

    const userExists = await validateUser(userId);
    if (!userExists) {
      return sendFail(res, "用户不存在", 404, 404);
    }

    const product = await getProductById(productId);
    if (!product) {
      return sendFail(res, "商品不存在", 404, 404);
    }

    if (quantity > Number(product.stock)) {
      return sendFail(res, "加入数量不能超过库存");
    }

    const [existingRows] = await pool.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ? AND product_id = ?
      LIMIT 1
      `,
      [userId, productId]
    );

    if (existingRows.length > 0) {
      const item = existingRows[0];
      const newQuantity = Number(item.quantity) + quantity;
      if (newQuantity > Number(product.stock)) {
        return sendFail(res, "购物车商品数量不能超过库存");
      }
      await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQuantity, item.id]);
    } else {
      await pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );
    }

    const cart = await getCartDetail(userId);
    return sendSuccess(res, cart, "加入购物车成功");
  } catch (err) {
    return next(err);
  }
});

app.patch("/api/cart/items/:itemId", async (req, res, next) => {
  try {
    const itemId = toPositiveInt(req.params.itemId);
    const quantity = toPositiveInt(req.body.quantity);

    if (!itemId || !quantity) {
      return sendFail(res, "itemId 和 quantity 必须是正整数");
    }

    const [rows] = await pool.query(
      `
      SELECT ci.id, ci.user_id AS userId, ci.product_id AS productId, p.stock
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.id = ?
      LIMIT 1
      `,
      [itemId]
    );

    if (rows.length === 0) {
      return sendFail(res, "购物车项不存在", 404, 404);
    }

    const item = rows[0];
    if (quantity > Number(item.stock)) {
      return sendFail(res, "商品数量不能超过库存");
    }

    await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, itemId]);
    const cart = await getCartDetail(Number(item.userId));
    return sendSuccess(res, cart, "更新数量成功");
  } catch (err) {
    return next(err);
  }
});

app.delete("/api/cart/items/:itemId", async (req, res, next) => {
  try {
    const itemId = toPositiveInt(req.params.itemId);
    if (!itemId) {
      return sendFail(res, "itemId 必须是正整数");
    }

    const [rows] = await pool.query("SELECT user_id AS userId FROM cart_items WHERE id = ? LIMIT 1", [
      itemId
    ]);
    if (rows.length === 0) {
      return sendFail(res, "购物车项不存在", 404, 404);
    }

    const userId = Number(rows[0].userId);
    await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
    const cart = await getCartDetail(userId);
    return sendSuccess(res, cart, "删除成功");
  } catch (err) {
    return next(err);
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`backend running at http://${HOST}:${PORT}`);
});

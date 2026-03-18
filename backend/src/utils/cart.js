import { pool } from "../config/db.js";

export async function getCartDetail(userId) {
  const [items] = await pool.query(
    `
    SELECT
      ci.id,
      ci.user_id AS userId,
      ci.product_id AS productId,
      ci.quantity,
      p.name,
      p.subtitle,
      p.price,
      p.stock,
      p.image_url AS imageUrl
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id DESC
    `,
    [userId]
  );

  const normalizedItems = items.map((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    return {
      ...item,
      price,
      quantity,
      stock: Number(item.stock),
      subtotal: Number((price * quantity).toFixed(2))
    };
  });

  const totalCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Number(
    normalizedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
  );

  return {
    userId,
    items: normalizedItems,
    summary: {
      totalCount,
      totalPrice
    }
  };
}


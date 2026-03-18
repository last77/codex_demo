DROP DATABASE IF EXISTS pc_mall;
CREATE DATABASE pc_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pc_mall;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  subtitle VARCHAR(255) DEFAULT '',
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500) DEFAULT '',
  category VARCHAR(60) DEFAULT '',
  sales INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_product (user_id, product_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO users (id, username) VALUES
  (1, 'demo_user');

INSERT INTO products (name, subtitle, price, stock, image_url, category, sales) VALUES
  ('Xiaomi 14 Pro', '徕卡影像，2K 全等深微曲屏', 4999.00, 45, 'https://picsum.photos/seed/p1/420/300', '手机', 1260),
  ('iPhone 15', 'A16 芯片，灵动岛，4800 万像素', 5999.00, 30, 'https://picsum.photos/seed/p2/420/300', '手机', 980),
  ('华为 MateBook 14', '2.8K OLED 触控屏，轻薄本', 6299.00, 22, 'https://picsum.photos/seed/p3/420/300', '电脑', 430),
  ('联想拯救者 R7000', 'R7 + RTX4060，电竞游戏本', 7299.00, 18, 'https://picsum.photos/seed/p4/420/300', '电脑', 520),
  ('Redmi K70', '2K 旗舰直屏，骁龙 8 Gen2', 2499.00, 60, 'https://picsum.photos/seed/p5/420/300', '手机', 1730),
  ('罗技 MX Master 3S', '办公旗舰鼠标，静音微动', 699.00, 150, 'https://picsum.photos/seed/p6/420/300', '外设', 2100),
  ('Keychron K8 Pro', '机械键盘，支持热插拔', 569.00, 110, 'https://picsum.photos/seed/p7/420/300', '外设', 890),
  ('Sony WH-1000XM5', '主动降噪头戴耳机', 2399.00, 40, 'https://picsum.photos/seed/p8/420/300', '耳机', 760),
  ('小米 27 寸显示器', '2K IPS，100Hz 高刷', 1099.00, 75, 'https://picsum.photos/seed/p9/420/300', '显示器', 650),
  ('Apple Watch S9', '健康监测，S9 SiP 芯片', 2999.00, 35, 'https://picsum.photos/seed/p10/420/300', '穿戴', 540),
  ('DJI Osmo Action 4', '运动相机，4K 120fps', 2498.00, 27, 'https://picsum.photos/seed/p11/420/300', '影像', 320),
  ('任天堂 Switch OLED', '掌机主机二合一，OLED 屏', 2299.00, 50, 'https://picsum.photos/seed/p12/420/300', '游戏', 1180);


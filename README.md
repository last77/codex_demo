# 简易 PC 商城（Vue3 + Express + MySQL）

本项目是一个前后端分离示例，包含：
- 商品列表页
- 购物车页（固定用户 `user_id=1`）

数据来源为 MySQL，购物车支持增删改查和总价计算。

## 目录结构

```text
.
├─ backend              # Node.js + Express + mysql2
├─ frontend             # Vue3 + Vite + Pinia + Vue Router
└─ sql
   └─ init.sql          # 建表和种子数据
```

## 数据库位置（系统目录）

当前已迁移到仓库外目录：

- MySQL 程序目录：`D:\mysql-system\mysql-9.6.0-winx64`
- MySQL 数据目录：`D:\mysql-system\data`
- MySQL 配置文件：`D:\mysql-system\my.ini`

说明：数据库已不依赖项目目录下的 `mysql-local`。

## 1) 初始化数据库

```powershell
cmd /c "\"D:\mysql-system\mysql-9.6.0-winx64\bin\mysql.exe\" --default-character-set=utf8mb4 --protocol=TCP -h 127.0.0.1 -P 3306 -u root -p123456 < \"D:\flutter demo\test_codex\sql\init.sql\""
```

## 2) 启动服务（数据库 + 后端 + 前端）

### 2.1 启动 MySQL

```powershell
Start-Process -FilePath "D:\mysql-system\mysql-9.6.0-winx64\bin\mysqld.exe" -ArgumentList "--defaults-file=D:\mysql-system\my.ini"
```

可用下面命令确认 3306 端口已监听：

```powershell
netstat -ano | Select-String ":3306" | Select-String "LISTENING"
```

### 2.2 启动后端

```powershell
cd "D:\flutter demo\test_codex\backend"
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

默认地址：`http://localhost:3000`

### 2.3 启动前端

```powershell
cd "D:\flutter demo\test_codex\frontend"
npm.cmd install
npm.cmd run dev -- --port 5174
```

默认地址：`http://localhost:5174/products`

## 3) 关闭服务（数据库 + 后端 + 前端）

### 3.1 按端口关闭（推荐）

```powershell
$ports = 5174, 3000, 3306
foreach ($port in $ports) {
  $pids = netstat -ano | Select-String ":$port" | Select-String "LISTENING" | ForEach-Object {
    ($_ -split '\s+')[-1]
  } | Select-Object -Unique
  foreach ($pid in $pids) {
    if ($pid -match '^\d+$') {
      taskkill /PID $pid /F | Out-Null
      Write-Output "killed pid=$pid (port=$port)"
    }
  }
}
```

### 3.2 正常关闭 MySQL（推荐）

```powershell
"D:\mysql-system\mysql-9.6.0-winx64\bin\mysqladmin.exe" --protocol=TCP -h 127.0.0.1 -P 3306 -u root -p123456 shutdown
```

## 环境变量模板

后端使用 [backend/.env.example](backend/.env.example)：

```env
PORT=3000
HOST=0.0.0.0
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=pc_mall
```

## API 概览

- `GET /api/products`：商品列表（支持分页参数 `page`、`pageSize`）
- `GET /api/cart?userId=1`：查询购物车
- `POST /api/cart/items`：加入购物车
- `PATCH /api/cart/items/:itemId`：更新购物车数量
- `DELETE /api/cart/items/:itemId`：删除购物车项

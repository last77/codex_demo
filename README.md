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
├─ mysql-local          # 本地免安装 MySQL（ZIP 解压版）
└─ sql
   └─ init.sql          # 建表与种子数据
```

## 1) 初始化数据库

如果你已安装系统 MySQL，可在项目根目录执行：

```bash
mysql -u root -p < sql/init.sql
```

如果你使用本项目的本地 MySQL（`mysql-local`），可执行：

```powershell
& cmd.exe /c '"D:\flutter demo\test_codex\mysql-local\mysql-9.6.0-winx64\bin\mysql.exe" --default-character-set=utf8mb4 -h 127.0.0.1 -P 3306 -u root -p123456 < "D:\flutter demo\test_codex\sql\init.sql"'
```

## 2) 开启服务（前后端 + 数据库）

### 2.1 开启 MySQL（本地 ZIP 版）

```powershell
node -e "const {spawn}=require('child_process'); const exe='D:\\flutter demo\\test_codex\\mysql-local\\mysql-9.6.0-winx64\\bin\\mysqld.exe'; const args=['--defaults-file=D:\\flutter demo\\test_codex\\mysql-local\\my.ini']; const p=spawn(exe,args,{detached:true,stdio:'ignore'}); p.unref(); console.log('mysql started');"
```

### 2.2 开启后端

```powershell
cd "D:\flutter demo\test_codex\backend"
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

默认端口：`3000`

### 2.3 开启前端

```powershell
cd "D:\flutter demo\test_codex\frontend"
npm.cmd install
npm.cmd run dev -- --port 5174
```

默认访问地址：`http://localhost:5174/products`

## 3) 关闭服务（前后端 + 数据库）

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

### 3.2 按已知 PID 关闭

```powershell
taskkill /PID 9896 /F    # 前端示例
taskkill /PID 33188 /F   # 后端示例
taskkill /PID 13820 /F   # MySQL 示例
```

## 4) 网络访问控制（是否允许局域网访问）

### 4.1 允许局域网访问（LAN）

- 前端：`npm.cmd run dev -- --host 0.0.0.0 --port 5174`
- 后端：`HOST=0.0.0.0`（默认）
- 局域网访问示例：`http://你的局域网IP:5174/products`

### 4.2 仅本机访问（禁止局域网访问）

- 前端：`npm.cmd run dev -- --host 127.0.0.1 --port 5174`
- 后端：在 `backend/.env` 中设置 `HOST=127.0.0.1`
- 仅本机访问地址：`http://localhost:5174/products`

## 5) API 概览

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


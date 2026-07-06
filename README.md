# Backstage Management System

基于 Vue 3、TypeScript、Vite 和 Element Plus 开发的电商后台管理系统。

项目包含权限、商品、订单、数据看板和操作日志等常见后台功能。当前接口由 Node.js API 服务提供，可以直接运行和体验。

## 功能

- 登录、退出和 Token 鉴权
- 用户、角色和权限管理
- 菜单权限与按钮权限控制
- 品牌、平台属性、SPU 和 SKU 管理
- 商品图片上传、库存和上下架管理
- 订单查询、详情和状态流转
- 首页数据看板
- 操作日志查询
- 侧边栏折叠、面包屑和多页签导航
- 全局请求异常处理

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts
- Node.js
- Sass
- ESLint、Stylelint、Prettier
- Husky、lint-staged、Commitlint

## 运行项目

### 环境要求

- Node.js `>= 20.19.0`
- pnpm `>= 11.2.2`

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

该命令会同时启动 Node.js API 服务和 Vite 前端服务。

默认访问地址：

```text
http://localhost:5173
```

API 服务默认地址：

```text
http://127.0.0.1:3000
```

也可以分别启动：

```bash
pnpm run dev:api
pnpm run dev:web
```

### 构建项目

```bash
pnpm run build
```

### 代码检查

```bash
pnpm run lint
```

## 测试账号

| 用户名   | 密码     | 说明                   |
| -------- | -------- | ---------------------- |
| `admin`  | `111111` | 管理员，拥有全部权限   |
| `system` | `111111` | 系统用户，拥有部分权限 |
| `editor` | `111111` | 已停用，无法登录       |

## 项目结构

```text
├─ mock/             # 接口路由和内存数据
├─ public/           # 静态资源
├─ scripts/          # 开发辅助脚本
├─ server/           # Node.js API 服务
├─ src/
│  ├─ api/           # API 请求与类型
│  ├─ components/    # 公共组件
│  ├─ directives/    # 自定义指令
│  ├─ layout/        # 后台布局
│  ├─ router/        # 路由配置
│  ├─ store/         # Pinia 状态管理
│  ├─ styles/        # 全局样式
│  ├─ utils/         # 工具函数
│  └─ views/         # 页面
└─ package.json
```

## 数据说明

项目使用 Node.js 服务提供后端接口，接口路由和内存数据位于 `mock/` 目录，由 `server/index.cjs` 加载并注册。

首页图表由 ECharts 绘制，图表数据位于 `mock/dashboard.ts`。

接口数据保存在 Node.js 服务内存中，重启 API 服务后会恢复为初始数据。

## License

本项目基于 [MIT License](./LICENSE) 开源。

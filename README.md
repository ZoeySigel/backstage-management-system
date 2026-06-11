# Backstage Management System

基于 Vue 3、TypeScript、Vite 和 Element Plus 开发的电商后台管理系统。

项目包含权限、商品、订单、数据看板和操作日志等常见后台功能。当前接口由 Mock 提供，可以直接运行和体验。

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
- vite-plugin-mock
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

默认访问地址：

```text
http://localhost:5173
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
├─ mock/             # Mock 接口和数据
├─ public/           # 静态资源
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

项目使用 `vite-plugin-mock` 模拟后端接口，Mock 文件位于 `mock/` 目录。

首页图表由 ECharts 绘制，图表数据位于 `mock/dashboard.ts`。

Mock 数据保存在开发服务器内存中，重启开发服务器后会恢复为初始数据。

## License

本项目基于 [MIT License](./LICENSE) 开源。

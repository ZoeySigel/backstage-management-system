# Backstage Management System

基于 Vue 3、TypeScript、Vite 和 Element Plus 开发的电商后台管理系统。项目已移除原 `mock/` 模拟接口，改为使用 Node.js 原生 HTTP 服务提供真实 API，并通过本地 JSON 数据文件进行持久化读写。

## 功能

- 登录、退出和 Token 鉴权
- 用户、角色和权限管理
- 菜单权限与按钮权限控制
- 品牌、平台属性、SPU 和 SKU 管理
- 商品图片上传、库存和上下架管理
- 订单查询、详情和状态流转校验
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
- Node.js 原生 HTTP API
- Sass
- ESLint、Stylelint、Prettier
- Husky、lint-staged、Commitlint

## 后端说明

后端入口位于 `server/index.cjs`，不依赖 Express、Prisma、Mock.js 或 vite-plugin-mock。

服务启动后会自动生成数据文件：

```text
server/data/database.json
```

该文件用于保存用户、角色、权限、商品、订单和操作日志等数据。页面中的新增、编辑、删除、分配权限和订单状态流转都会写入该文件。若需要重置数据，停止服务后删除 `server/data/database.json`，再次启动会自动恢复初始数据。

## 运行项目

### 环境要求

- Node.js `>= 20.19.0`
- pnpm `>= 11.2.2`

### 安装依赖

```bash
pnpm install
```

### 启动开发服务

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
public/           # 静态资源
scripts/          # 开发辅助脚本
server/           # Node.js API 服务
src/
  api/            # 前端 API 请求与类型
  components/     # 公共组件
  directives/     # 自定义指令
  layout/         # 后台布局
  router/         # 路由配置
  store/          # Pinia 状态管理
  styles/         # 全局样式
  utils/          # 工具函数
  views/          # 页面
```

## License

本项目基于 [MIT License](./LICENSE) 开源。

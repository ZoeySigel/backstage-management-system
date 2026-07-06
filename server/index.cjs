const { Buffer } = require('node:buffer')
const crypto = require('node:crypto')
const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')

const HOST = process.env.API_HOST || '127.0.0.1'
const PORT = Number(process.env.API_PORT || process.env.PORT || 3000)
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'database.json')
const TOKEN_SECRET = process.env.API_TOKEN_SECRET || 'backstage-management-system-local-secret'
const TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 24

const response = (code, data = null, message = 'success') => ({ code, data, message })
const ok = (data = null) => response(200, data)
const fail = (message, code = 201, data = null) => response(code, data, message)

const formatDate = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(String(password), salt, 12000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) {
    return false
  }

  const [salt] = storedHash.split(':')
  return hashPassword(password, salt) === storedHash
}

const base64Url = (value) => Buffer.from(value).toString('base64url')

const signToken = (userId) => {
  const payload = base64Url(
    JSON.stringify({
      userId,
      exp: Date.now() + TOKEN_EXPIRES_IN,
    }),
  )
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')

  return `${payload}.${signature}`
}

const parseToken = (token) => {
  if (!token || !token.includes('.')) {
    return undefined
  }

  const [payload, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')

  if (signature !== expected) {
    return undefined
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))

    if (!data.exp || Date.now() > data.exp) {
      return undefined
    }

    return data
  } catch {
    return undefined
  }
}

const getRequestToken = (headers) => {
  const token = headers.token

  if (typeof token === 'string' && token) {
    return token
  }

  const authorization = headers.authorization

  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice(7)
  }

  return ''
}

const buildPermissionTree = () => [
  {
    id: 1,
    parentId: 0,
    name: 'Home',
    permission: 'home',
    type: 'menu',
  },
  {
    id: 2,
    parentId: 0,
    name: 'About',
    permission: 'about',
    type: 'menu',
  },
  {
    id: 10,
    parentId: 0,
    name: 'Access Control',
    permission: 'acl',
    type: 'directory',
    children: [
      {
        id: 11,
        parentId: 10,
        name: 'User Management',
        permission: 'user',
        type: 'menu',
        children: [
          { id: 12, parentId: 11, name: 'Add User', permission: 'user.add', type: 'button' },
          { id: 13, parentId: 11, name: 'Edit User', permission: 'user.update', type: 'button' },
          { id: 14, parentId: 11, name: 'Delete User', permission: 'user.delete', type: 'button' },
          {
            id: 15,
            parentId: 11,
            name: 'Batch Delete User',
            permission: 'user.batchDelete',
            type: 'button',
          },
          {
            id: 16,
            parentId: 11,
            name: 'Assign User Role',
            permission: 'user.assignRole',
            type: 'button',
          },
        ],
      },
      {
        id: 20,
        parentId: 10,
        name: 'Role Management',
        permission: 'role',
        type: 'menu',
        children: [
          { id: 21, parentId: 20, name: 'Add Role', permission: 'role.add', type: 'button' },
          { id: 22, parentId: 20, name: 'Edit Role', permission: 'role.update', type: 'button' },
          { id: 23, parentId: 20, name: 'Delete Role', permission: 'role.delete', type: 'button' },
          {
            id: 24,
            parentId: 20,
            name: 'Assign Permission',
            permission: 'role.assignPermission',
            type: 'button',
          },
        ],
      },
      {
        id: 30,
        parentId: 10,
        name: 'Permission Management',
        permission: 'permission',
        type: 'menu',
        children: [
          {
            id: 31,
            parentId: 30,
            name: 'Add Permission',
            permission: 'permission.add',
            type: 'button',
          },
          {
            id: 32,
            parentId: 30,
            name: 'Edit Permission',
            permission: 'permission.update',
            type: 'button',
          },
          {
            id: 33,
            parentId: 30,
            name: 'Delete Permission',
            permission: 'permission.delete',
            type: 'button',
          },
        ],
      },
    ],
  },
  {
    id: 40,
    parentId: 0,
    name: 'Product',
    permission: 'product',
    type: 'directory',
    children: [
      {
        id: 41,
        parentId: 40,
        name: 'Brand Management',
        permission: 'brand',
        type: 'menu',
        children: [
          { id: 42, parentId: 41, name: 'Add Brand', permission: 'brand.add', type: 'button' },
          { id: 43, parentId: 41, name: 'Edit Brand', permission: 'brand.update', type: 'button' },
          {
            id: 44,
            parentId: 41,
            name: 'Delete Brand',
            permission: 'brand.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 50,
        parentId: 40,
        name: 'Attribute Management',
        permission: 'attr',
        type: 'menu',
        children: [
          { id: 51, parentId: 50, name: 'Add Attribute', permission: 'attr.add', type: 'button' },
          {
            id: 52,
            parentId: 50,
            name: 'Edit Attribute',
            permission: 'attr.update',
            type: 'button',
          },
          {
            id: 53,
            parentId: 50,
            name: 'Delete Attribute',
            permission: 'attr.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 60,
        parentId: 40,
        name: 'SPU Management',
        permission: 'spu',
        type: 'menu',
        children: [
          { id: 61, parentId: 60, name: 'Add SPU', permission: 'spu.add', type: 'button' },
          { id: 62, parentId: 60, name: 'Edit SPU', permission: 'spu.update', type: 'button' },
          { id: 63, parentId: 60, name: 'Delete SPU', permission: 'spu.delete', type: 'button' },
        ],
      },
      {
        id: 70,
        parentId: 40,
        name: 'SKU Management',
        permission: 'sku',
        type: 'menu',
        children: [
          { id: 71, parentId: 70, name: 'Add SKU', permission: 'sku.add', type: 'button' },
          { id: 72, parentId: 70, name: 'Edit SKU', permission: 'sku.update', type: 'button' },
          { id: 73, parentId: 70, name: 'Delete SKU', permission: 'sku.delete', type: 'button' },
        ],
      },
    ],
  },
  {
    id: 80,
    parentId: 0,
    name: 'Order Management',
    permission: 'order',
    type: 'menu',
    children: [
      {
        id: 81,
        parentId: 80,
        name: 'Update Order Status',
        permission: 'order.updateStatus',
        type: 'button',
      },
    ],
  },
  {
    id: 90,
    parentId: 0,
    name: 'Operation Log',
    permission: 'operationLog',
    type: 'menu',
  },
]

const flattenPermissions = (items, result = []) => {
  for (const item of items) {
    result.push(item)

    if (item.children?.length) {
      flattenPermissions(item.children, result)
    }
  }

  return result
}

const allPermissionCodes = (items) => flattenPermissions(items).map((item) => item.permission)

const createInitialDb = () => {
  const permissions = buildPermissionTree()
  const adminPermissions = allPermissionCodes(permissions)
  const systemPermissions = [
    'home',
    'about',
    'acl',
    'user',
    'user.add',
    'user.update',
    'user.assignRole',
    'role',
    'role.update',
    'role.assignPermission',
    'product',
    'brand',
    'brand.add',
    'brand.update',
    'attr',
    'attr.add',
    'attr.update',
    'spu',
    'spu.add',
    'spu.update',
    'sku',
    'sku.add',
    'sku.update',
    'order',
    'order.updateStatus',
    'operationLog',
  ]

  return {
    users: [
      {
        id: 1,
        userId: 1,
        username: 'admin',
        name: 'Admin',
        avatar:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23409eff"/><text x="50" y="58" font-size="32" text-anchor="middle" fill="white">A</text></svg>',
        passwordHash: hashPassword('111111'),
        roleId: 1,
        status: true,
        createTime: '2026-06-01 09:00:00',
      },
      {
        id: 2,
        userId: 2,
        username: 'system',
        name: 'System User',
        avatar:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%2367c23a"/><text x="50" y="58" font-size="32" text-anchor="middle" fill="white">S</text></svg>',
        passwordHash: hashPassword('111111'),
        roleId: 2,
        status: true,
        createTime: '2026-06-03 10:30:00',
      },
      {
        id: 3,
        userId: 3,
        username: 'editor',
        name: 'Editor',
        avatar:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e6a23c"/><text x="50" y="58" font-size="32" text-anchor="middle" fill="white">E</text></svg>',
        passwordHash: hashPassword('111111'),
        roleId: 3,
        status: false,
        createTime: '2026-06-05 14:20:00',
      },
    ],
    roles: [
      {
        id: 1,
        roleName: 'Administrator',
        remark: 'Full access to the management system',
        createTime: '2026-06-01 09:00:00',
      },
      {
        id: 2,
        roleName: 'System Operator',
        remark: 'Daily operation permissions',
        createTime: '2026-06-02 11:15:00',
      },
      {
        id: 3,
        roleName: 'Editor',
        remark: 'Disabled sample role',
        createTime: '2026-06-04 16:40:00',
      },
    ],
    permissions,
    rolePermissions: {
      1: adminPermissions,
      2: systemPermissions,
      3: ['home', 'about'],
    },
    brands: [
      {
        id: 1,
        name: 'Acme Digital',
        logoUrl: '/favicon.svg',
        description: 'Consumer electronics brand',
        createTime: '2026-06-01 09:30:00',
      },
      {
        id: 2,
        name: 'NovaTech',
        logoUrl: '/favicon.svg',
        description: 'Office and laptop devices',
        createTime: '2026-06-02 10:20:00',
      },
      {
        id: 3,
        name: 'HomePlus',
        logoUrl: '/favicon.svg',
        description: 'Smart home appliances',
        createTime: '2026-06-04 15:45:00',
      },
    ],
    categories: [
      { id: 1, parentId: 0, name: 'Digital' },
      { id: 2, parentId: 0, name: 'Home Appliance' },
      { id: 11, parentId: 1, name: 'Phone' },
      { id: 12, parentId: 1, name: 'Computer' },
      { id: 21, parentId: 2, name: 'Kitchen' },
      { id: 111, parentId: 11, name: 'Smart Phone' },
      { id: 121, parentId: 12, name: 'Laptop' },
      { id: 211, parentId: 21, name: 'Coffee Machine' },
    ],
    attrs: [
      {
        id: 1,
        categoryId: 111,
        attrName: 'Color',
        values: [
          { id: 1, valueName: 'Black' },
          { id: 2, valueName: 'White' },
          { id: 3, valueName: 'Blue' },
        ],
      },
      {
        id: 2,
        categoryId: 111,
        attrName: 'Storage',
        values: [
          { id: 4, valueName: '256GB' },
          { id: 5, valueName: '512GB' },
        ],
      },
      {
        id: 3,
        categoryId: 121,
        attrName: 'Memory',
        values: [
          { id: 6, valueName: '16GB' },
          { id: 7, valueName: '32GB' },
        ],
      },
    ],
    spus: [
      {
        id: 1,
        name: 'Flagship Smart Phone',
        brand: 'Acme Digital',
        category: 'Smart Phone',
        price: 4999,
        imageUrl: '/favicon.svg',
        description: 'High performance mobile phone',
        status: true,
        createTime: '2026-06-06 09:20:00',
      },
      {
        id: 2,
        name: 'Lightweight Laptop',
        brand: 'NovaTech',
        category: 'Laptop',
        price: 6999,
        imageUrl: '/favicon.svg',
        description: 'Thin laptop for office work',
        status: false,
        createTime: '2026-06-07 14:10:00',
      },
    ],
    skus: [
      {
        id: 1,
        spuName: 'Flagship Smart Phone',
        skuName: 'Flagship Smart Phone Black 256GB',
        specs: 'Color: Black; Storage: 256GB',
        price: 4999,
        stock: 86,
        imageUrl: '/favicon.svg',
        status: true,
        createTime: '2026-06-06 10:00:00',
      },
      {
        id: 2,
        spuName: 'Flagship Smart Phone',
        skuName: 'Flagship Smart Phone White 512GB',
        specs: 'Color: White; Storage: 512GB',
        price: 5999,
        stock: 8,
        imageUrl: '/favicon.svg',
        status: false,
        createTime: '2026-06-06 11:10:00',
      },
      {
        id: 3,
        spuName: 'Lightweight Laptop',
        skuName: 'Lightweight Laptop Silver 16GB 1TB',
        specs: 'Color: Silver; Memory: 16GB; Disk: 1TB',
        price: 6999,
        stock: 12,
        imageUrl: '/favicon.svg',
        status: true,
        createTime: '2026-06-07 15:30:00',
      },
    ],
    orders: [
      {
        id: 1,
        orderNo: 'ORD202606110001',
        customerName: 'Zhang San',
        phone: '13800138001',
        address: 'Shanghai Pudong Century Avenue 100',
        amount: 4999,
        status: 'pending_shipment',
        products: [
          {
            id: 1,
            skuName: 'Flagship Smart Phone Black 256GB',
            specs: 'Color: Black; Storage: 256GB',
            price: 4999,
            quantity: 1,
            imageUrl: '/favicon.svg',
          },
        ],
        createTime: '2026-06-11 09:20:00',
        payTime: '2026-06-11 09:22:00',
      },
      {
        id: 2,
        orderNo: 'ORD202606100008',
        customerName: 'Li Si',
        phone: '13800138002',
        address: 'Beijing Chaoyang Jianguo Road 88',
        amount: 5999,
        status: 'shipped',
        products: [
          {
            id: 2,
            skuName: 'Flagship Smart Phone White 512GB',
            specs: 'Color: White; Storage: 512GB',
            price: 5999,
            quantity: 1,
            imageUrl: '/favicon.svg',
          },
        ],
        createTime: '2026-06-10 13:10:00',
        payTime: '2026-06-10 13:12:00',
        shipTime: '2026-06-10 17:30:00',
      },
      {
        id: 3,
        orderNo: 'ORD202606090016',
        customerName: 'Wang Wu',
        phone: '13800138003',
        address: 'Shenzhen Nanshan Science Park 6',
        amount: 13998,
        status: 'completed',
        products: [
          {
            id: 3,
            skuName: 'Lightweight Laptop Silver 16GB 1TB',
            specs: 'Color: Silver; Memory: 16GB; Disk: 1TB',
            price: 6999,
            quantity: 2,
            imageUrl: '/favicon.svg',
          },
        ],
        createTime: '2026-06-09 10:35:00',
        payTime: '2026-06-09 10:38:00',
        shipTime: '2026-06-09 15:20:00',
      },
      {
        id: 4,
        orderNo: 'ORD202606080021',
        customerName: 'Zhao Liu',
        phone: '13800138004',
        address: 'Hangzhou Xihu Wen San Road 20',
        amount: 6999,
        status: 'pending_payment',
        products: [
          {
            id: 4,
            skuName: 'Lightweight Laptop Silver 16GB 1TB',
            specs: 'Color: Silver; Memory: 16GB; Disk: 1TB',
            price: 6999,
            quantity: 1,
            imageUrl: '/favicon.svg',
          },
        ],
        createTime: '2026-06-08 16:05:00',
      },
    ],
    operationLogs: [
      {
        id: 1,
        operator: 'admin',
        module: 'Order',
        action: 'Update order status',
        method: 'PUT',
        url: '/api/order/status/1',
        ip: '127.0.0.1',
        location: 'Local',
        result: 'success',
        message: 'Initial sample log',
        duration: 34,
        createTime: '2026-06-11 10:30:00',
      },
      {
        id: 2,
        operator: 'system',
        module: 'User',
        action: 'Create user',
        method: 'POST',
        url: '/api/acl/user/add',
        ip: '127.0.0.1',
        location: 'Local',
        result: 'success',
        message: 'Initial sample log',
        duration: 46,
        createTime: '2026-06-10 11:15:00',
      },
    ],
  }
}

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(createInitialDb(), null, 2))
  }
}

const loadDb = () => {
  ensureDataFile()
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
}

let db = loadDb()

const saveDb = () => {
  const tempFile = `${DB_FILE}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2))
  fs.renameSync(tempFile, DB_FILE)
}

const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1

const paginate = (items, page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.max(1, Number(pageSize) || 10)
  const start = (safePage - 1) * safePageSize

  return {
    records: items.slice(start, start + safePageSize),
    total: items.length,
  }
}

const includesKeyword = (values, keyword) => {
  const normalizedKeyword = String(keyword || '')
    .trim()
    .toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  return values.some((value) =>
    String(value || '')
      .toLowerCase()
      .includes(normalizedKeyword),
  )
}

const findPermission = (items, id) => {
  for (const item of items) {
    if (item.id === Number(id)) {
      return item
    }

    if (item.children?.length) {
      const found = findPermission(item.children, id)

      if (found) {
        return found
      }
    }
  }

  return undefined
}

const findPermissionByCode = (items, permission) =>
  flattenPermissions(items).find((item) => item.permission === permission)

const deletePermission = (items, id) => {
  const index = items.findIndex((item) => item.id === Number(id))

  if (index !== -1) {
    items.splice(index, 1)
    return true
  }

  for (const item of items) {
    if (item.children?.length && deletePermission(item.children, id)) {
      return true
    }
  }

  return false
}

const addOperationLog = ({ user, module, action, method, url, result = 'success', message }) => {
  db.operationLogs.unshift({
    id: nextId(db.operationLogs),
    operator: user?.username || 'system',
    module,
    action,
    method,
    url,
    ip: '127.0.0.1',
    location: 'Local',
    result,
    message: message || (result === 'success' ? 'success' : 'failure'),
    duration: Math.floor(Math.random() * 80) + 20,
    createTime: formatDate(),
  })

  db.operationLogs = db.operationLogs.slice(0, 200)
}

const getRole = (roleId) => db.roles.find((item) => item.id === Number(roleId))

const getUserPermissionCodes = (user) => db.rolePermissions[user.roleId] || []

const getAuthenticatedUser = (headers) => {
  const tokenData = parseToken(getRequestToken(headers))

  if (!tokenData) {
    return undefined
  }

  const user = db.users.find((item) => item.userId === Number(tokenData.userId))

  if (!user || !user.status) {
    return undefined
  }

  return user
}

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(data))
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''

    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compilePath = (url) => {
  const paramNames = []
  const pattern = url
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^/]+)'
      }

      return escapeRegExp(segment)
    })
    .join('/')

  return {
    paramNames,
    regex: new RegExp(`^${pattern}/?$`),
  }
}

const route = (method, url, handler, options = {}) => {
  const compiled = compilePath(url)

  return {
    method,
    url,
    handler,
    public: Boolean(options.public),
    paramNames: compiled.paramNames,
    regex: compiled.regex,
  }
}

const moduleFromPath = (pathname) => {
  if (pathname.includes('/acl/user')) return 'User'
  if (pathname.includes('/acl/role')) return 'Role'
  if (pathname.includes('/acl/permission')) return 'Permission'
  if (pathname.includes('/product/brand')) return 'Brand'
  if (pathname.includes('/product/attr')) return 'Attribute'
  if (pathname.includes('/product/spu')) return 'SPU'
  if (pathname.includes('/product/sku')) return 'SKU'
  if (pathname.includes('/order')) return 'Order'
  if (pathname.includes('/user/login')) return 'Login'
  return 'System'
}

const routes = [
  route(
    'GET',
    '/api/health',
    () => ok({ status: 'ok', database: path.relative(process.cwd(), DB_FILE) }),
    {
      public: true,
    },
  ),
  route(
    'POST',
    '/api/user/login',
    ({ body, pathname }) => {
      const user = db.users.find((item) => item.username === body.username)

      if (!user || !user.status || !verifyPassword(body.password, user.passwordHash)) {
        addOperationLog({
          module: 'Login',
          action: 'Login',
          method: 'POST',
          url: pathname,
          result: 'failure',
          message: 'Incorrect username or password',
        })
        saveDb()
        return fail('Incorrect username or password')
      }

      const token = signToken(user.userId)
      addOperationLog({
        user,
        module: 'Login',
        action: 'Login',
        method: 'POST',
        url: pathname,
        result: 'success',
        message: 'Login success',
      })
      saveDb()

      return ok({ token })
    },
    { public: true },
  ),
  route('GET', '/api/user/info', ({ user }) => {
    const role = getRole(user.roleId)
    const permissions = getUserPermissionCodes(user)

    return ok({
      userId: user.userId,
      username: user.username,
      avatar: user.avatar,
      roles: role ? [role.roleName] : [],
      routes: permissions.filter((permission) => !permission.includes('.')),
      buttons: permissions.filter((permission) => permission.includes('.')),
    })
  }),
  route('POST', '/api/user/logout', () => ok(null)),

  route('GET', '/api/acl/user/list', ({ query }) => {
    const users = db.users
      .map((item) => ({
        id: item.id,
        username: item.username,
        name: item.name,
        role: getRole(item.roleId)?.roleName || '',
        status: item.status,
        createTime: item.createTime,
      }))
      .filter((item) => includesKeyword([item.username, item.name, item.role], query.keyword))

    return ok(paginate(users, query.page, query.pageSize))
  }),
  route('POST', '/api/acl/user/add', ({ body, user, pathname }) => {
    if (!body.username || !body.name) {
      return fail('Username and name are required')
    }

    if (db.users.some((item) => item.username === body.username)) {
      return fail('Username already exists')
    }

    const role = db.roles.find((item) => item.roleName === body.role) || db.roles[1] || db.roles[0]
    const id = nextId(db.users)

    db.users.push({
      id,
      userId: id,
      username: body.username,
      name: body.name,
      avatar:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23909399"/><text x="50" y="58" font-size="32" text-anchor="middle" fill="white">U</text></svg>',
      passwordHash: hashPassword('111111'),
      roleId: role?.id || 2,
      status: Boolean(body.status),
      createTime: formatDate(),
    })
    addOperationLog({ user, module: 'User', action: 'Create user', method: 'POST', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/acl/user/update/:id', ({ body, params, user, pathname }) => {
    const target = db.users.find((item) => item.id === Number(params.id))

    if (!target) {
      return fail('User not found')
    }

    const sameUsername = db.users.find(
      (item) => item.username === body.username && item.id !== target.id,
    )

    if (sameUsername) {
      return fail('Username already exists')
    }

    const role = db.roles.find((item) => item.roleName === body.role)
    target.username = body.username
    target.name = body.name
    target.status = Boolean(body.status)

    if (role) {
      target.roleId = role.id
    }

    addOperationLog({ user, module: 'User', action: 'Update user', method: 'PUT', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/acl/user/delete/:id', ({ params, user, pathname }) => {
    const id = Number(params.id)

    if (id === user.id) {
      return fail('Cannot delete current user')
    }

    const index = db.users.findIndex((item) => item.id === id)

    if (index === -1) {
      return fail('User not found')
    }

    db.users.splice(index, 1)
    addOperationLog({
      user,
      module: 'User',
      action: 'Delete user',
      method: 'DELETE',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('GET', '/api/acl/user/role/:id', ({ params }) => {
    const target = db.users.find((item) => item.id === Number(params.id))

    if (!target) {
      return fail('User not found')
    }

    return ok({
      roles: db.roles.map((item) => ({ id: item.id, roleName: item.roleName })),
      roleId: target.roleId,
    })
  }),
  route('POST', '/api/acl/user/assign-role/:id', ({ body, params, user, pathname }) => {
    const target = db.users.find((item) => item.id === Number(params.id))
    const role = db.roles.find((item) => item.id === Number(body.roleId))

    if (!target || !role) {
      return fail('User or role not found')
    }

    target.roleId = role.id
    addOperationLog({ user, module: 'User', action: 'Assign role', method: 'POST', url: pathname })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/acl/role/list', ({ query }) => {
    const roles = db.roles.filter((item) =>
      includesKeyword([item.roleName, item.remark], query.keyword),
    )

    return ok(paginate(roles, query.page, query.pageSize))
  }),
  route('POST', '/api/acl/role/add', ({ body, user, pathname }) => {
    if (!body.roleName) {
      return fail('Role name is required')
    }

    if (db.roles.some((item) => item.roleName === body.roleName)) {
      return fail('Role already exists')
    }

    const id = nextId(db.roles)
    db.roles.push({
      id,
      roleName: body.roleName,
      remark: body.remark || '',
      createTime: formatDate(),
    })
    db.rolePermissions[id] = ['home', 'about']
    addOperationLog({ user, module: 'Role', action: 'Create role', method: 'POST', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/acl/role/update/:id', ({ body, params, user, pathname }) => {
    const roleItem = db.roles.find((item) => item.id === Number(params.id))

    if (!roleItem) {
      return fail('Role not found')
    }

    roleItem.roleName = body.roleName
    roleItem.remark = body.remark || ''
    addOperationLog({ user, module: 'Role', action: 'Update role', method: 'PUT', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/acl/role/delete/:id', ({ params, user, pathname }) => {
    const id = Number(params.id)

    if (db.users.some((item) => item.roleId === id)) {
      return fail('Role is assigned to users')
    }

    const index = db.roles.findIndex((item) => item.id === id)

    if (index === -1) {
      return fail('Role not found')
    }

    db.roles.splice(index, 1)
    delete db.rolePermissions[id]
    addOperationLog({
      user,
      module: 'Role',
      action: 'Delete role',
      method: 'DELETE',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('GET', '/api/acl/role/permission/:id', ({ params }) => {
    if (!db.roles.some((item) => item.id === Number(params.id))) {
      return fail('Role not found')
    }

    return ok({
      permissions: db.permissions,
      checkedPermissions: db.rolePermissions[params.id] || [],
    })
  }),
  route('POST', '/api/acl/role/assign-permission/:id', ({ body, params, user, pathname }) => {
    if (!db.roles.some((item) => item.id === Number(params.id))) {
      return fail('Role not found')
    }

    db.rolePermissions[params.id] = Array.isArray(body.permissions) ? body.permissions : []
    addOperationLog({
      user,
      module: 'Role',
      action: 'Assign permission',
      method: 'POST',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/acl/permission/list', () => ok(db.permissions)),
  route('POST', '/api/acl/permission/add', ({ body, user, pathname }) => {
    if (!body.name || !body.permission || !body.type) {
      return fail('Permission name, code and type are required')
    }

    if (findPermissionByCode(db.permissions, body.permission)) {
      return fail('Permission code already exists')
    }

    const item = {
      id: nextId(flattenPermissions(db.permissions)),
      parentId: Number(body.parentId) || 0,
      name: body.name,
      permission: body.permission,
      type: body.type,
    }

    if (item.parentId === 0) {
      db.permissions.push(item)
    } else {
      const parent = findPermission(db.permissions, item.parentId)

      if (!parent) {
        return fail('Parent permission not found')
      }

      parent.children = parent.children || []
      parent.children.push(item)
    }

    addOperationLog({
      user,
      module: 'Permission',
      action: 'Create permission',
      method: 'POST',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/acl/permission/update/:id', ({ body, params, user, pathname }) => {
    const item = findPermission(db.permissions, params.id)

    if (!item) {
      return fail('Permission not found')
    }

    const samePermission = findPermissionByCode(db.permissions, body.permission)

    if (samePermission && samePermission.id !== item.id) {
      return fail('Permission code already exists')
    }

    item.name = body.name
    item.permission = body.permission
    item.type = body.type
    addOperationLog({
      user,
      module: 'Permission',
      action: 'Update permission',
      method: 'PUT',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/acl/permission/delete/:id', ({ params, user, pathname }) => {
    const item = findPermission(db.permissions, params.id)

    if (!item) {
      return fail('Permission not found')
    }

    if (item.children?.length) {
      return fail('Cannot delete permission with children')
    }

    deletePermission(db.permissions, params.id)
    const removedPermission = item.permission

    for (const roleId of Object.keys(db.rolePermissions)) {
      db.rolePermissions[roleId] = db.rolePermissions[roleId].filter(
        (permission) => permission !== removedPermission,
      )
    }

    addOperationLog({
      user,
      module: 'Permission',
      action: 'Delete permission',
      method: 'DELETE',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/product/brand/list', ({ query }) => {
    const brands = db.brands.filter((item) =>
      includesKeyword([item.name, item.description], query.keyword),
    )

    return ok(paginate(brands, query.page, query.pageSize))
  }),
  route('POST', '/api/product/brand/add', ({ body, user, pathname }) => {
    if (!body.name || !body.logoUrl) {
      return fail('Brand name and logo are required')
    }

    db.brands.push({
      id: nextId(db.brands),
      name: body.name,
      logoUrl: body.logoUrl,
      description: body.description || '',
      createTime: formatDate(),
    })
    addOperationLog({
      user,
      module: 'Brand',
      action: 'Create brand',
      method: 'POST',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/brand/update/:id', ({ body, params, user, pathname }) => {
    const brand = db.brands.find((item) => item.id === Number(params.id))

    if (!brand) {
      return fail('Brand not found')
    }

    brand.name = body.name
    brand.logoUrl = body.logoUrl
    brand.description = body.description || ''
    addOperationLog({ user, module: 'Brand', action: 'Update brand', method: 'PUT', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/product/brand/delete/:id', ({ params, user, pathname }) => {
    const index = db.brands.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return fail('Brand not found')
    }

    db.brands.splice(index, 1)
    addOperationLog({
      user,
      module: 'Brand',
      action: 'Delete brand',
      method: 'DELETE',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/product/category/:parentId', ({ params }) =>
    ok(db.categories.filter((item) => item.parentId === Number(params.parentId))),
  ),
  route('GET', '/api/product/attr/list/:categoryId', ({ params }) =>
    ok(db.attrs.filter((item) => item.categoryId === Number(params.categoryId))),
  ),
  route('POST', '/api/product/attr/add', ({ body, user, pathname }) => {
    db.attrs.push({
      id: nextId(db.attrs),
      categoryId: Number(body.categoryId),
      attrName: body.attrName,
      values: (body.values || []).map((item, index) => ({
        id: item.id || Date.now() + index,
        valueName: item.valueName,
      })),
    })
    addOperationLog({
      user,
      module: 'Attribute',
      action: 'Create attribute',
      method: 'POST',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/attr/update/:id', ({ body, params, user, pathname }) => {
    const attr = db.attrs.find((item) => item.id === Number(params.id))

    if (!attr) {
      return fail('Attribute not found')
    }

    attr.categoryId = Number(body.categoryId)
    attr.attrName = body.attrName
    attr.values = (body.values || []).map((item, index) => ({
      id: item.id || Date.now() + index,
      valueName: item.valueName,
    }))
    addOperationLog({
      user,
      module: 'Attribute',
      action: 'Update attribute',
      method: 'PUT',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/product/attr/delete/:id', ({ params, user, pathname }) => {
    const index = db.attrs.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return fail('Attribute not found')
    }

    db.attrs.splice(index, 1)
    addOperationLog({
      user,
      module: 'Attribute',
      action: 'Delete attribute',
      method: 'DELETE',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/product/spu/list', ({ query }) => {
    const spus = db.spus.filter((item) =>
      includesKeyword([item.name, item.brand, item.category], query.keyword),
    )

    return ok(paginate(spus, query.page, query.pageSize))
  }),
  route('POST', '/api/product/spu/add', ({ body, user, pathname }) => {
    db.spus.push({
      id: nextId(db.spus),
      name: body.name,
      brand: body.brand,
      category: body.category,
      price: Number(body.price) || 0,
      imageUrl: body.imageUrl,
      description: body.description || '',
      status: Boolean(body.status),
      createTime: formatDate(),
    })
    addOperationLog({ user, module: 'SPU', action: 'Create SPU', method: 'POST', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/spu/update/:id', ({ body, params, user, pathname }) => {
    const spu = db.spus.find((item) => item.id === Number(params.id))

    if (!spu) {
      return fail('SPU not found')
    }

    Object.assign(spu, {
      name: body.name,
      brand: body.brand,
      category: body.category,
      price: Number(body.price) || 0,
      imageUrl: body.imageUrl,
      description: body.description || '',
      status: Boolean(body.status),
    })
    addOperationLog({ user, module: 'SPU', action: 'Update SPU', method: 'PUT', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/spu/status/:id', ({ body, params, user, pathname }) => {
    const spu = db.spus.find((item) => item.id === Number(params.id))

    if (!spu) {
      return fail('SPU not found')
    }

    spu.status = Boolean(body.status)
    addOperationLog({
      user,
      module: 'SPU',
      action: 'Update SPU status',
      method: 'PUT',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/product/spu/delete/:id', ({ params, user, pathname }) => {
    const index = db.spus.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return fail('SPU not found')
    }

    db.spus.splice(index, 1)
    addOperationLog({ user, module: 'SPU', action: 'Delete SPU', method: 'DELETE', url: pathname })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/product/sku/list', ({ query }) => {
    const skus = db.skus.filter((item) =>
      includesKeyword([item.spuName, item.skuName, item.specs], query.keyword),
    )

    return ok(paginate(skus, query.page, query.pageSize))
  }),
  route('POST', '/api/product/sku/add', ({ body, user, pathname }) => {
    db.skus.push({
      id: nextId(db.skus),
      spuName: body.spuName,
      skuName: body.skuName,
      specs: body.specs,
      price: Number(body.price) || 0,
      stock: Number(body.stock) || 0,
      imageUrl: body.imageUrl,
      status: Boolean(body.status),
      createTime: formatDate(),
    })
    addOperationLog({ user, module: 'SKU', action: 'Create SKU', method: 'POST', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/sku/update/:id', ({ body, params, user, pathname }) => {
    const sku = db.skus.find((item) => item.id === Number(params.id))

    if (!sku) {
      return fail('SKU not found')
    }

    Object.assign(sku, {
      spuName: body.spuName,
      skuName: body.skuName,
      specs: body.specs,
      price: Number(body.price) || 0,
      stock: Number(body.stock) || 0,
      imageUrl: body.imageUrl,
      status: Boolean(body.status),
    })
    addOperationLog({ user, module: 'SKU', action: 'Update SKU', method: 'PUT', url: pathname })
    saveDb()
    return ok(null)
  }),
  route('PUT', '/api/product/sku/status/:id', ({ body, params, user, pathname }) => {
    const sku = db.skus.find((item) => item.id === Number(params.id))

    if (!sku) {
      return fail('SKU not found')
    }

    sku.status = Boolean(body.status)
    addOperationLog({
      user,
      module: 'SKU',
      action: 'Update SKU status',
      method: 'PUT',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),
  route('DELETE', '/api/product/sku/delete/:id', ({ params, user, pathname }) => {
    const index = db.skus.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return fail('SKU not found')
    }

    db.skus.splice(index, 1)
    addOperationLog({ user, module: 'SKU', action: 'Delete SKU', method: 'DELETE', url: pathname })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/order/list', ({ query }) => {
    const orders = db.orders.filter((item) => {
      const matchesKeyword = includesKeyword(
        [item.orderNo, item.customerName, item.phone],
        query.keyword,
      )
      const matchesStatus = !query.status || item.status === query.status
      return matchesKeyword && matchesStatus
    })

    return ok(paginate(orders, query.page, query.pageSize))
  }),
  route('GET', '/api/order/detail/:id', ({ params }) => {
    const order = db.orders.find((item) => item.id === Number(params.id))
    return order ? ok(order) : fail('Order not found')
  }),
  route('PUT', '/api/order/status/:id', ({ body, params, user, pathname }) => {
    const order = db.orders.find((item) => item.id === Number(params.id))
    const nextStatus = body.status
    const allowedTransitions = {
      pending_payment: ['cancelled'],
      pending_shipment: ['shipped', 'cancelled'],
      shipped: ['completed'],
      completed: [],
      cancelled: [],
    }

    if (!order) {
      return fail('Order not found')
    }

    if (!allowedTransitions[order.status].includes(nextStatus)) {
      return fail('This status transition is not allowed')
    }

    order.status = nextStatus

    if (nextStatus === 'shipped') {
      order.shipTime = formatDate()
    }

    addOperationLog({
      user,
      module: 'Order',
      action: 'Update order status',
      method: 'PUT',
      url: pathname,
    })
    saveDb()
    return ok(null)
  }),

  route('GET', '/api/dashboard/overview', () => {
    const stock = db.skus.reduce((sum, item) => sum + Number(item.stock || 0), 0)
    const categorySales = db.spus.reduce((result, item) => {
      const existing = result.find((entry) => entry.name === item.category)

      if (existing) {
        existing.value += 1
      } else {
        result.push({ name: item.category, value: 1 })
      }

      return result
    }, [])

    return ok({
      stats: [
        { key: 'users', title: 'Users', value: db.users.length, change: 12.5 },
        { key: 'spu', title: 'SPU Count', value: db.spus.length, change: 8.2 },
        { key: 'sku', title: 'SKU Count', value: db.skus.length, change: 16.8 },
        { key: 'stock', title: 'Stock Count', value: stock, change: -3.4 },
      ],
      salesTrend: {
        dates: ['06-05', '06-06', '06-07', '06-08', '06-09', '06-10', '06-11'],
        sales: [18200, 23600, 21900, 28400, 32100, 29800, 35600],
        orders: [128, 156, 142, 186, 208, 193, 235],
      },
      categorySales,
      lowStock: db.skus
        .filter((item) => Number(item.stock) <= 20)
        .map((item) => ({ skuName: item.skuName, stock: item.stock })),
    })
  }),

  route('GET', '/api/system/operation-log/list', ({ query }) => {
    const logs = db.operationLogs.filter((item) => {
      const matchesKeyword = includesKeyword(
        [item.operator, item.module, item.action, item.url, item.message],
        query.keyword,
      )
      const matchesModule = !query.module || item.module === query.module
      const matchesResult = !query.result || item.result === query.result
      return matchesKeyword && matchesModule && matchesResult
    })

    return ok(paginate(logs, query.page, query.pageSize))
  }),
  route('GET', '/api/system/operation-log/detail/:id', ({ params }) => {
    const log = db.operationLogs.find((item) => item.id === Number(params.id))
    return log ? ok(log) : fail('Operation log not found')
  }),
]

const findRoute = (pathname, method) => {
  for (const item of routes) {
    if (item.method !== method) {
      continue
    }

    const match = pathname.match(item.regex)

    if (match) {
      return {
        route: item,
        params: Object.fromEntries(
          item.paramNames.map((name, index) => [name, decodeURIComponent(match[index + 1])]),
        ),
      }
    }
  }

  return undefined
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, null)
    return
  }

  const startTime = Date.now()
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`)
  const matched = findRoute(requestUrl.pathname, req.method || 'GET')

  if (!matched) {
    sendJson(res, 404, {
      code: 404,
      data: null,
      message: `Route not found: ${req.method} ${requestUrl.pathname}`,
    })
    return
  }

  try {
    const body = await readBody(req)
    const query = Object.fromEntries(requestUrl.searchParams.entries())
    const user = matched.route.public ? undefined : getAuthenticatedUser(req.headers)

    if (!matched.route.public && !user) {
      sendJson(res, 200, response(401, null, 'Login status has expired, please login again'))
      return
    }

    const result = await matched.route.handler({
      body,
      headers: req.headers,
      method: req.method,
      module: moduleFromPath(requestUrl.pathname),
      params: matched.params,
      pathname: requestUrl.pathname,
      query,
      req,
      user,
    })

    sendJson(res, 200, result)
  } catch (error) {
    const user = getAuthenticatedUser(req.headers)
    addOperationLog({
      user,
      module: moduleFromPath(requestUrl.pathname),
      action: 'Request failed',
      method: req.method || 'GET',
      url: requestUrl.pathname,
      result: 'failure',
      message: error instanceof Error ? error.message : 'Internal server error',
    })
    saveDb()
    sendJson(res, 500, {
      code: 500,
      data: null,
      message: error instanceof Error ? error.message : 'Internal server error',
      duration: Date.now() - startTime,
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`[api] Node.js API service running at http://${HOST}:${PORT}`)
  console.log(`[api] Persistent data file: ${path.relative(process.cwd(), DB_FILE)}`)
  console.log(`[api] Registered ${routes.length} real API routes`)
})

const shutdown = () => {
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

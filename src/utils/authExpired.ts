type AuthExpiredHandler = () => void | Promise<void>

let handler: AuthExpiredHandler | undefined
let handling = false

export const setAuthExpiredHandler = (authExpiredHandler: AuthExpiredHandler) => {
  handler = authExpiredHandler
}

export const notifyAuthExpired = async () => {
  if (handling) {
    return
  }

  handling = true

  try {
    globalThis.localStorage.removeItem('TOKEN')
    await handler?.()
  } finally {
    handling = false
  }
}

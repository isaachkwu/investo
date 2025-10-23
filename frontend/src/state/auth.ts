export type Tokens = { accessToken: string; refreshToken: string }

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export function setTokens(tokens: Tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token)
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getToken() {
  return getAccessToken()
}

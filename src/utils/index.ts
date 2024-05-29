
export * from './type'
export * from './object'
export * from './browser/element'
export * from './browser/elements'
import { isString } from './type'

// 字符串超过255截取
export function stringSlice (str) {
  if (isString(str) && str.length > 255) {
    return str.slice(0, 254) + '$'
  }
  return str
}
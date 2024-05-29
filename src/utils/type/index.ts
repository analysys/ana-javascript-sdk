


const typeMap = {}
const typeArr = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'HTMLCollection']

typeArr.map(function(item) {
  typeMap["[object " + item + "]"] = item.toLowerCase()
})

function type (value: any): string {

  const typeName = typeof value

  if (typeName === 'object') {
    return typeMap[Object.prototype.toString.call(value)]
  }

  return typeName
}

export function isNumber(value: any): boolean {
  return type(value) === 'number'
}

export function isString(value: any): boolean {
  return type(value) === 'string'
}

export function isArray(value: any): boolean {
  return Array.isArray(value)
}

export function isBoolean (value: any): boolean {
  return type(value) === 'boolean'
}

export function isObject (value: any): boolean {
  return type(value) === 'object'
}

export function isFunction (value: any): boolean {
  return type(value) === 'function'
}

export const isElement = (value: any) => value instanceof HTMLElement

export function isHtmlCollection (value: any) :boolean {
  return type(value) === 'htmlcollection'
}

// 判断是否为空对象
export function isEmptyObject (obj) {
  for (const name in obj) {
    return false
  }
  return true
}

export function isAny () {
  return true
}

export const isSvg = (value: any) => value instanceof SVGElement

export default type

import { isSpider } from "./isSpider"


// 获取url参数
export function getUrlParams(url: string) {
  const reg = /(\w+)=([^&]+)/g;
  const params = {};
  let match;
  
  while ((match = reg.exec(url)) !== null) {
    params[match[1]] = match[2];
  }
  
  return params;
}


export function getUrlDomain (url) {
  if (url) {
    return url.split('?')[0]
  }
  return ''
}

export { isSpider }

// 单页面模式下监听路径变化
export function pathChange (fn: Function) {

  const pushState = window.history.pushState
  const replaceState = window.history.replaceState

  window.history.pushState = function () {
    const arg = arguments
    pushState.apply(window.history, arg)
    setTimeout(() => {
      fn && fn(arg)
    })
  }

  window.history.replaceState = function (e) {
    const arg = arguments
    replaceState.apply(window.history, arg)
    setTimeout(() => {
      fn && fn(arg)
    })
  }

  const state = pushState ? 'popstate' : 'hashchange'

  window.addEventListener(state, function () {
    const arg = arguments
    setTimeout(() => {
      fn && fn(arg)
    })
  })
}


export const getDomainFromUrl = function (domianStatus) {
  let host = window.location.hostname
  const urlArr = host.split("/");
  if (urlArr.length > 2) {
    host = urlArr[2]
  }
  const ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
  if (ip.test(host) === true || host === 'localhost') return ''
  const strAry = host.split('.')
  let level = domianStatus === true ? 2 : strAry.length
  if (level < 2) {
    level = 2
  }
  const urlDomain = []
  if (strAry.length > 1) {
    if (strAry.length < level) {
      level = strAry.length
    }
    for (let i = strAry.length - 1; i >= 0; i--) {
      if (urlDomain.length === level) {
        break
      }
      urlDomain.push(strAry[i])
    }

  } else {
    return ''
  }

  return urlDomain.reverse().join('.')
}
import { isHtmlCollection, getElementAttr, isArray, isFunction, isElement} from '../../../utils'

// 获取配置曝光元素有效列表
export function getConfigEles (elements) {
  const list = []
  if (isArray(elements)) {
    for (let i = 0; i < elements.length; i++) {
      const itemEl = elements[i]
      if (isElement(itemEl)) {
        list.push(itemEl)
      }

      if (isHtmlCollection(itemEl)) {
        for (let j = 0; j < itemEl.length; j++) {
          list.push(itemEl[j])
        }
      }
    }
  }
  return list
}


// 判断是否是通过配置配置的曝光元素
export function isConfigExposureEle (elements, ele) {
  if (elements) {

    if (isElement(elements) && elements === ele) {
      return true
    }

    if (isArray(elements)) {
      for (let i = 0; i < elements.length; i++) {
        const itemEl = elements[i]
        if (isElement(itemEl) && itemEl === ele) {
          return true
        }

        if (isHtmlCollection(itemEl)) {
          for (let j = 0; j < itemEl.length; j++) {
            if (itemEl[j] === ele) {
              return true
            }
          }
        }
      }
    }
    
    if (isFunction(elements)) {
      const res = elements()
      return isConfigExposureEle(res, ele)
    }
  }

  return false
}

// 判断是否是通过属性标示的曝光元素
export function isExposureEle (ele) {
  if ((getElementAttr(ele, 'data-ark-exposure') !== null)) return true
  return false
}

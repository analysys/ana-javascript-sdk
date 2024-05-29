import { config } from '../../store/config'
import ajax from '../../utils/requrst/ajax'
import { globalWindow } from '../../constant/index'
import { loadJs } from "../../utils/browser"
import { getElementContent } from "../../utils"
import { getTagName, getEleIndex, eleForEach } from "../../utils/browser/elements"
import track from './track'
import { printLog } from '../printLog'

let visualMap = null
const href = globalWindow.location.href

// 上报可视化数据
export function visualClick (e) {
  
  if (!visualMap) {
    return false
  }
  
  const pathList = []
  eleForEach(e.target || e.srcElement, (el) => {
    pathList.push(el)
    if (getTagName(el) === 'body') {
      return 'break'
    }
  })

  const max = pathList.length - 2
  function getPath (min) {
    let path = ''
    let pathIndex = ''
    for (let i = max; i >= min; i--) {
      const item = pathList[i]
      const tagName = getTagName(pathList[i])
      if (tagName) {
        const str = tagName + (item.id ? `#${item.id}` : '')
        path += str
        pathIndex += str
        if (tagName !== 'html' && tagName !== 'body' && !item.id) {
          pathIndex += `${getEleIndex(item)}`
        }
        if (tagName === 'button') {
          break
        }
      }
    }
    return {
      path, pathIndex
    }
  }
  
  // 获取dom链条组合
  const pathArr = []
  for (let i = 0; i < max; i++) {
    const { path, pathIndex } = getPath(i)
    pathArr.push({path, el: pathList[i]}, {path: pathIndex, el: pathList[i]})
  }
  
  // 匹配链条对应的可视化埋点
  const itemMap = {}
  pathArr.forEach(o => {
    const item = visualMap[o.path]
    if (item && !itemMap[item.appEventId]) {
      item['el'] = o.el
      itemMap[item.appEventId] = item
    }
  })

  // 上报可视化埋点数据
  try {
    for (const key in itemMap) {
      const attrs = {
        $element_content: getElementContent(itemMap[key].el)
      }
      itemMap[key].properties.forEach(o => {
        attrs[o.key] = o.value
      })
      track(key, attrs)
    }
  } catch(err) {
    console.log(err)
  }
}

// 获取可视化埋点数据
export function getVisualList () {
  const visitorConfigURL = config.visitorConfigURL
  if (visitorConfigURL && href.indexOf('arkheatmap=true') === -1 && href.indexOf('visual=true') === -1) {
    
    ajax({
      url: visitorConfigURL + 'configure',
      data: {
        appkey: config.appkey,
        lib: 'Js',
        url: window.location.href
      },
      timeout: config.getDataTimeout
    }, function(res) {
      const list = res.data.data
      if (list && list.length) {
        printLog('Get Visual Event List from app')
        printLog(JSON.stringify(list, null, 2))
        visualMap = {}
        list.forEach(o => {
          let path = ''
          for (let i = o.new_path.length - 3; i >= 0; i--) {
            const item = o.new_path[i]
            const tagName = item.tagName
            const str = tagName + (item.id ? `#${item.id}` : '') + (item.row !== undefined && !item.id ? item.row : '')
            path += str
          }
          visualMap[path] = o
        })
      } else {
        visualMap = null
      }
    })
  }
}

// 动态加载可视化交互文件
export function loadVisual () {
  // 设置可视化埋点
  if (href.indexOf('visual=true') > -1 && config.visitorConfigURL) {
    loadJs(`${config.SDKFileDirectory || '/sdk/'}AnalysysAgent_JS_SDK_VISUAL.min.js`)
  }
}
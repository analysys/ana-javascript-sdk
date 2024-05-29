
import { globalWindow } from '../../constant/index'
import { isNumber, assign, getElementContent, getElementAttr, getElementXpath } from '../../utils'
import { isConfigExposureEle, isExposureEle, getConfigEles } from './utils'
import MD5 from '../../utils/md5'

const AnalysysAgent = globalWindow.AnalysysAgent

const exposureConfig = {
  valid_time: 300, //停留有效时间
  property: {}, //自定义参数
  exposure_click: false, // 是否自动采集曝光元素点击事件
  multiple: false as any, //true或毫秒值, 是否重复采集曝光点数据或多少毫秒后可再次采集
  element_list: [],
}

// 记录曝光元素
const exposureElMap = new WeakMap()

 // 创建dom结构改变监听
 var mutation = new MutationObserver((mutations) => {
  for (let i = 0; i < mutations.length; i++) {
    const addedNodes = mutations[i].addedNodes
    addIo(addedNodes, true)
  }
 })

// 创建与视界相交监听
const io = new IntersectionObserver((entries) => {

  for (let i = 0; i < entries.length; i++) {
    const item = entries[i]
    const ele = item.target
    // 显示到可视区域
    if (item.intersectionRatio > 0) {
      if (exposureElMap.get(ele) === false) {
        const time = setTimeout(function () {
          send(ele)
        }, exposureConfig.valid_time)
        exposureElMap.set(ele, time)
      }
    }

    // 从可视区域离开
    if (item.intersectionRatio === 0) {
      const n = exposureElMap.get(ele)
      if (isNumber(n)) {
        clearTimeout(n)
        exposureElMap.set(ele, false)
      }
    }
  }
}, {
  threshold: [0.01]
})

// 添加元素交叉观察
function addIo (eles, isVerify = false) {
  for (let i = 0; i < eles.length; i++) {
    const ele = eles[i]
    if (ele.nodeType === 1) {
      if (!exposureElMap.has(ele) && (isExposureEle(ele) || isConfigExposureEle(exposureConfig.element_list, ele))) {
        io.observe(ele)
        exposureElMap.set(ele, false)
      }
      if (ele.childNodes.length > 0) {
        addIo(ele.childNodes, isVerify)
      }
    }
  }
}

function send (ele) {

  // 获取元素上曝光属性
  let exposureAttr : any = getElementAttr(ele, 'data-ark-exposure')
  
  if (exposureAttr) {
    try {
      exposureAttr = JSON.parse(exposureAttr) || {}
    } catch (e) {
      exposureAttr = {}
    }
  } else {
    exposureAttr = {}
  }

  // 获取exposure_id
  if (!exposureAttr.exposure_id) {
    const xpath = getElementXpath(ele)
    exposureAttr['exposure_id'] = MD5(xpath)
  }

  // 获取曝光文本
  if (!exposureAttr.exposure_content) {
    exposureAttr['exposure_content'] = getElementContent(ele)
  }

  const exposureAttrs = assign({}, exposureConfig.property, exposureAttr)
  AnalysysAgent.track('exposure_points', exposureAttrs)

  ele['exposureAttrs'] = exposureAttrs

  if (!exposureConfig.multiple) {
    exposureElMap.set(ele, true)
    io.unobserve(ele)
  }

  // xx毫秒后可以再次曝光
  if (exposureConfig.multiple > 0) {
    exposureElMap.set(ele, true)
    setTimeout(() => {
      exposureElMap.set(ele, false)
    }, exposureConfig.multiple)
  }
}

function init () {

  assign(exposureConfig, AnalysysAgent.config.exposure)

  addIo(getConfigEles(exposureConfig.element_list))
  addIo(document.querySelectorAll('[data-ark-exposure]'))

  mutation.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 采集曝光点点击事件
  if (exposureConfig.exposure_click) {
    document.addEventListener("click", (e) => {
      const el = e.target
      const exposureAttrs = el['exposureAttrs']
      if (exposureAttrs && !el['isExposureClick']) {
        AnalysysAgent.track('exposure_click', exposureAttrs)
        el['isExposureClick'] = true
      }
    })
  }
}

const href = globalWindow.location.href
if (AnalysysAgent && href.indexOf('visual=true') < 0 && href.indexOf('arkheatmap=true') < 0) {
  // sdk初始化未完成
  !AnalysysAgent.isInit ? AnalysysAgent.on('afterInit', init) : init()
}
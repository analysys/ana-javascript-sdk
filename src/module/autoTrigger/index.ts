
import { startUp, pageView, userClick, webClick, webstay } from '../methods'
import ready from '../ready'
import { config } from '../../store/config'
import { pathChange } from '../../utils/path'
import { eventAttribute } from '../../store/eventAttribute'
import { getDeviceType, loadJs } from "../../utils/browser"
import { globalWindow } from '../../constant/index'
import { triggerPageClose, setPageHideTime } from '../methods/pageclose'
import { getVisualList, visualClick } from '../methods/visual'
import { setHybirdWebUrl } from '../sendData/hybrid'
import { isHybrid } from '../../store/hybrid'

let scrollTime = null

// 是否自动采集pv
function triggerPageView () {

  if (config.auto) {
    ready(pageView)()
  } else {
    eventAttribute.webstay.xwhen = 0
    eventAttribute.pageview.xwhen = +new Date()
  }

  // hybrid模式下实时同步当前url给原生端
  setHybirdWebUrl()

  // 获取可视化数据
  getVisualList()
}

/**
 * sdk自动触发器
 */
function autoTrigger () {
  if (!isHybrid && config.autoStartUp) {
    startUp()
  }

  triggerPageView()

  // 监听路径变化
  if (config.hash) {
    pathChange(function () {
      const path = eventAttribute.pageview.path
      if (path !== document.location.href) {
        triggerPageClose()
        setTimeout(triggerPageView, 100)
      }
    })
  }
  

  // 退出页面监听
  const closeEventName = 'onpageshow' in globalWindow ? 'pagehide' : 'beforeunload'
  globalWindow.addEventListener(closeEventName, () => {
    // 设置页面卸载状态
    eventAttribute.isUnload = true
    triggerPageClose()
  })

  const deviceType = getDeviceType()

  // 全埋点
  if (config.autoTrack || config.visitorConfigURL) {
    const eventName = deviceType === 'desktop' ? 'mousedown' : 'touchstart'
    document.addEventListener(eventName, (e) => {
      userClick(e)
      visualClick(e)
    })
  }

  const href = globalWindow.location.href

  const SDKFileDirectory = config.SDKFileDirectory || '/sdk/'

  // 热图
  if (config.autoHeatmap) {
    if (href.indexOf('arkheatmap=true') === -1) {
      if (href.indexOf('visual=true') === -1) { // 不是是在热图模式和可视化模式下上报热图数据
        document.addEventListener('click', webClick)
        
        // 滚动行为
        document.addEventListener('scroll', function() {
          clearTimeout(scrollTime)
          scrollTime = setTimeout(function() {
            webstay()
          }, 1000)
        })
      }
    } else {
      // 动态加载热图显示文件
      loadJs(`${SDKFileDirectory}AnalysysAgent_JS_SDK_HEATMAP.min.js`)
    }
  }

  

  // 记录页面隐藏时间
  setPageHideTime()
}

export default autoTrigger
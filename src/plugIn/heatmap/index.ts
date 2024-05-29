import { createView } from './view/index'
import viewController from './controller'
import { storeInit } from './store'
import iframeMessage from './controller/iframMessage'

storeInit()

function init () {
  

  // 添加热图视图
  createView()

  // 添加视图控制器
  viewController()

  if (window.top !== window.self) {
    iframeMessage()
  }
}

if (document.readyState === 'complete') {
  init()
} else {
  document.addEventListener('readystatechange', function() {
    if (document.readyState === 'complete') {
      init()
    }
  })
}
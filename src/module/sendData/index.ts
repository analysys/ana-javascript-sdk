
import { buriedPointData } from '../../types'
import ajax from '../../utils/requrst/ajax'
import image from '../../utils/requrst/image'
import { config } from '../../store/config'
import { eventAttribute, implementEventCallback } from '../../store/eventAttribute'
import { getPostData, addPostData, delPostData } from '../../store/core'
import { errorLog, successLog } from '../printLog/index'
import { globalWindow } from '../../constant/index'
import { isFunction } from '../../utils/type'
import beacon from '../../utils/requrst/beacon'
import { isHybrid } from '../../store/hybrid'
import hybridSendDate from './hybrid'
import { emit } from '../methods'

// 一次最多上报20条
const MAXLINENUM = 20

// 上报失败后重试次数
const RETRNUM = 3

// 正在上报数据
let doingList: Array<buriedPointData> = []

// 当前重试次数
let retryCount = 0

// 发送请求
function postData () : any {

  // 待上报数据
  const todoList: Array<buriedPointData> = getPostData()

  if (doingList.length || !todoList.length) {
    return
  }

  // 取出最多 MAXLINENUM 条数据进入上报队列
  doingList = todoList.splice(0, MAXLINENUM)

  const option = {
    url: config.uploadURL + 'up' + '?appid=' + config.appkey,
    data: doingList,
    encryptType: config.encryptType
  }

  successLog({
    key: option.url,
    value: doingList,
    code: 20012
  })

  // 开启调试模式，不入库
  if (config.debugMode === 1) {
    delPostData(doingList)
    doingList = []
    return
  }

  if (globalWindow.AnalysysModal && isFunction(globalWindow.AnalysysModule)) {
    globalWindow.AnalysysModal(option.data)
  }
  
  ajax({
    url: option.url,
    method: 'POST',
    data: option.data,
    timeout: config.sendDataTimeout
  }, function() {

     // 成功后回调函数
    doingList.forEach(o => {
      implementEventCallback(o)

      // 数据上报成功之后执行
      emit('successSend', o)
    })

    // 上报成功后删除队列与相应的缓存数据
    delPostData(doingList)
    doingList = []

    // 继续上报剩下的数据，如果有的话
    postData()

    successLog({
      code: 20001
    })

    retryCount = 0
  }, function() {

    doingList = []
    errorLog({
      code: 60008
    })
    // 失败后重试上报，最多重试RETRNUM次
    if (retryCount < RETRNUM) {
      postData()
      retryCount++
    }
  })
}

/**
 * img方式上报
 * @param data 
 */

function imgGetData (data: buriedPointData) {
  const option = {
    url: config.uploadURL + 'up' + '?appid=' + config.appkey,
    data: JSON.stringify([data])
  }
  successLog({
    key: option.url,
    value: [data],
    code: 20012
  })
  image(option, () => {
    successLog({
      code: 20001
    })

    // 成功后回调函数
    implementEventCallback(data)

    // 数据上报成功之后执行
    emit('successSend', data)
    
  }, () => {
    errorLog({
      code: 60008
    })
    addPostData(data)
    postData()
  })
}


/**
 * 上报数据
 * @param data object 
 * @param fn 上报成功后回调函数
 * @param isTrack 是否是自定义事件
 */

function sendData (data: buriedPointData, fn?: Function, isTrack?: boolean) : any {

  const xwhat = data.xwhat

  // Hybrid模式下由原生端上报
  if (isHybrid) {

    // 部分预制事件走原生自定义上报
    if (['$web_click', '$webstay', '$user_click'].indexOf(xwhat) > -1) {
      isTrack = true
    }

    // hybrid模式下删除这些属性，由原生上报
    const arr = ['$is_first_day', '$session_id', '$is_time_calibrated', '$startup_time', '$lib', '$lib_version', '$platform', '$debug', '$is_login']
    arr.forEach(o => {
      delete data.xcontext[o]
    })

    let functionParams = [data.xcontext]
    if (xwhat === '$pageview') {
      functionParams.unshift(data.xcontext.$title || '')
    }
    if (isTrack) {
      functionParams.unshift(xwhat)
    }

    if (xwhat === '$alias') {
      functionParams = [data.xwho, data.xcontext.$original_id]
    }

    hybridSendDate(isTrack ? 'track' : xwhat, functionParams)
    return
  }

  // 设置回调函数
  if (fn && isFunction(fn)) {
    eventAttribute.eventCallback[data.xwhen] = fn
  }

  // 上报之前执行
  emit('afterSend', {...data, xcontext: {...data.xcontext}})

  // 页面卸载时采用beacon上报
  if (eventAttribute.isUnload && navigator && navigator.sendBeacon) {
    const option = {
      url: config.uploadURL + 'up' + '?appid=' + config.appkey,
      data: [data]
    }
    beacon(option)
    successLog({
      key: option.url,
      value: option.data,
      code: 20012
    })
    return
  }

  if (config.sendType === 'img') {
    imgGetData(data)
  } else {
    
    // 加入待上报队列
    addPostData(data)
    postData()
  }
}

export default sendData
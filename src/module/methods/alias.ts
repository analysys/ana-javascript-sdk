import sendData from '../sendData'
import fillData from '../fillData'
import { lengthCheck } from '../../utils/verify/index'
import { config } from '../../store/config'
import { profileSetOnce } from './profile'
import { setCoreParam, getId } from '../../store/core'
import { successLog, errorLog } from '../printLog'
import { commonAttrs } from '../../constant/eventAttrs'
import { isFunction } from '../../utils/type'

function alias (aliasId: string, fn?: Function) {

  // 验证id是否符合格式
  if (!lengthCheck(aliasId)) {
    errorLog({
      code: 60005,
      value: aliasId,
      fn: 'alias'
    })
    return false
  }

  if (aliasId === getId()) {
    // successLog({
    //   code: 20014
    // })
    // fn && isFunction(fn) && fn()
    return
  }

  // 设置登录后id
  setCoreParam('ARK_LOGINID', aliasId)

  successLog({
    code: 20014
  })

  // 获取上报数据模块
  const res = fillData('$alias')

  // 删除掉不相关属性
  commonAttrs.forEach(o => {
    if (res.xcontext[o]) {
      delete res.xcontext[o]
    }
  })

  // 是否设置自动采集
  if (config.autoProfile === true) {
    sendData(res, fn)
    profileSetOnce()
  } else {
    sendData(res, fn)
  }
}

export default alias
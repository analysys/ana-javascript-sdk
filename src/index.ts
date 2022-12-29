/**
 * 小程序标准版sdk
 */

import { initConfig } from './types'
import { setConfig } from './store/config'
import { globalWindow, optionsDefault } from './constant/index'
import ready from './module/ready'

import {
  pageView,
  profileSetOnce, profileSet, profileAppend, profileIncrement, profileDelete, profileUnset,
  reset,
  track,
  alias,
  registerSuperProperty, registerSuperProperties, getSuperProperty, getSuperProperties,
  unRegisterSuperProperty,
  clearSuperProperties,
  getPresetProperties,
  identify,
  getDistinctId,
  pageProperty
} from './module/methods/index'



class ArkJsSdk {
  constructor () {
    
  }
  config: initConfig = optionsDefault();
  pageView = ready(pageView);
  registerSuperProperty = ready(registerSuperProperty, true);
  registerSuperProperties = ready(registerSuperProperties, true);
  getSuperProperty = ready(getSuperProperty);
  getSuperProperties = getSuperProperties;
  unRegisterSuperProperty = unRegisterSuperProperty;
  clearSuperProperties = clearSuperProperties;
  profileSetOnce = profileSetOnce;
  profileSet = profileSet;
  profileAppend = profileAppend;
  profileIncrement = profileIncrement;
  profileDelete = profileDelete;
  profileUnset = profileUnset;
  reset = reset;
  track = ready(track);
  alias = ready(alias);
  getPresetProperties = getPresetProperties;
  identify = identify;
  getDistinctId = getDistinctId;
  pageProperty = pageProperty;

  // 初始化传入配置
  init (config: initConfig) {
    setConfig(config, (o)=>{
      
      this.config = o

      if (this.config.name) {
        globalWindow[this.config.name] = globalWindow.AnalysysAgent
      }
      
    })
  }
}

const ArkSdk = new ArkJsSdk()
globalWindow.AnalysysAgent = ArkSdk



export default ArkSdk
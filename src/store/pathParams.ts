import { getUrlParams } from '../utils/path'
/**
 * 路径相关参数信息存储
 */

 interface paramsValue {
  campaign_id?: string;
  utm_campaign_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}

export const pathParams : paramsValue = {
  utm_campaign_id: '',
  utm_source: '',
  utm_medium: '',
  utm_term: '',
  utm_content: '',
  utm_campaign: '',
}

export function getPathParams (): object {
  return pathParams
}

export function setPathParams () : any {
  const searchParams = getUrlParams(window.location.href)
  Object.keys(pathParams).forEach(key => {
    if (searchParams[key]) {
      pathParams[key] = searchParams[key]
    }
  })
}
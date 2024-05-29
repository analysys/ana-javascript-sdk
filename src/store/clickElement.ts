/**
 * 全埋点相关属性存储
 */

import { getElementTargetUrl, getElementContent, getElementPath, getElementOffset, getElementScroll, getElementAttr, getElementXpath } from '../utils'
import { elementClickableCheck } from '../utils/verify/index'


 interface clickElementValue {
  element_id?: string;
  element_content?: string;
  element_type?: string;
  element_name?: string;
  element_path?: string;
  element_target_url?: string
  element_class_name?: string
 }

 export const userClickAttrs: clickElementValue = {}

 export const webClickAttrs: {
  page_width?: number;
  page_height?: number;
  click_x?: number;
  click_y?: number;
  element_x?: number;
  element_y?: number;
  element_clickable?: number;
 } = {}

 export function setUserClickAttrs (el: HTMLElement) {
  userClickAttrs.element_id = el.id
  userClickAttrs.element_content = getElementContent(el)
  userClickAttrs.element_type = el.tagName.toLowerCase()
  userClickAttrs.element_name = getElementAttr(el, 'name')
  userClickAttrs.element_class_name = getElementAttr(el, 'class')
  userClickAttrs.element_target_url = getElementTargetUrl(el)
  userClickAttrs.element_path = getElementXpath(el, {
    endTag: ['button']
  })
 }

 export function setWebClickAttrs(e) {
  
  const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
  const scrollY = document.documentElement.scrollTop || document.body.scrollTop

  const x = e.pageX || (e.clientX + scrollX)
  const y = e.pageY || (e.clientY + scrollY)

  const el = e.target || e.srcElement

  webClickAttrs.click_x = x
  webClickAttrs.click_y = y

  const eleScr = getElementScroll(el)
  const eleOff = getElementOffset(el)
 
  webClickAttrs.element_x = x - (eleOff.left - eleScr.scrollLeft)
  webClickAttrs.element_y = y - (eleOff.top - eleScr.scrollTop)

  webClickAttrs.element_clickable = elementClickableCheck(el) ? 1 : 0
 }
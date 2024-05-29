import { createElement, eleCss } from '../../utils/index'
import './index.scss'
import { heatConfig } from '../../store/index'
import { renderElementList } from '../nav'
import { useElementXpath } from '../../../../utils'

const htmlTpl = function(clickNum, clickNumPercent) {
  const percent = (clickNumPercent * 100).toFixed(2)
  return `
      <span class="ark-heat-click-element-text" data-percent="${percent}" data-click-num="${clickNum}">${percent}%</span>
      <span class="ark-heat-click-element-tips">
        <span class="ark-click-num">
          <label>点击数</label>
          ${clickNum}
        </span>
        <span class="ark-click-percent">
          <label>点击占比</label>
          ${percent}%
        </span>
      </span>
  `
}

let max = 0
const colors = ['63,81,181', '33,150,243', '0,188,212', '87,201,92', '205,220,57', '255,235,59', '255,152,0', '255,87,34', '229,57,53', '183,28,28']

export function renderElement (data) {

  emptyElement()

  const list = data.detail
  const elementList = []

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    let ele = useElementXpath(item.path)[0]

    let targetEle = null
    

    if (ele) {

      if (item.clickNum > max) {
        max = item.clickNum
      }

      const colorIndex = Math.ceil((item.clickNum / max) * 10) - 1
      const rgba = 'rgba(' + colors[colorIndex] + ',.9)'

      // 改变目标元素
      if (['input', 'img', 'select', 'textarea', 'svg'].indexOf(ele.tagName.toLowerCase()) > -1) {
        // 备份目标元素
        targetEle = ele
        ele = ele.parentNode
      }

      const position = eleCss(ele, 'position')

      if (['relative', 'fixed', 'absolute', 'sticky'].indexOf(position) === -1) {
        ele.style.position = 'relative'
      }

      let positionStyle = {}
      if (targetEle) {
        positionStyle = {
          left: targetEle.offsetLeft + 'px',
          top: targetEle.offsetTop + 'px',
          width: targetEle.offsetWidth + 'px',
          height: targetEle.offsetHeight + 'px'
        }
      }

      createElement('span', {
        class: 'ark-heat-click-element',
        content: htmlTpl(item.clickNum, item.clickNumPercent),
        style: {
          backgroundColor: rgba,
          ...positionStyle
        }
      }, ele)

      elementList.push(item)

    }
  }

  // 渲染点击元素列表
  renderElementList(elementList)
}

// 点击元素显示与隐藏
export function elementDisplay () {
  const body = document.querySelector('body')
  const className = body.className
  if (heatConfig.heatMapShow && heatConfig.heatMapType === 'element') {
    body.className = className.replace(/ ark-headmap-body-element-none/g, '')
  } else {
    if (className.indexOf('ark-headmap-body-element-none') === -1) {
      body.className = className + ' ark-headmap-body-element-none'
    }
  }
}


export function emptyElement () {
  document.querySelectorAll('.ark-heat-click-element').forEach(o => {
    o.remove()
  })
}
import './index.scss'
import { createElement, getEleOffset } from '../../utils/index'
import { heatConfig, displayConfig } from '../../store/index'
import { heatMapData } from '../../store/heatmap'
import h337 from '../../utils/heatmap.js'
import { resetGradient } from '../../utils/colorRange.js'
import { useElementXpath } from '../../../../utils'

const html = ``

export let heatmap = null

export default function () {
  createElement('div', {
    id: 'arkHeatmapLocation',
    class: 'ark-heatmap-location',
    content: html
  }, document.getElementById('arkHeadmapBody'))
  setHeatMapSize()
}

// 设置热图容器大小
export function setHeatMapSize () {
  const arkHeatmapLocation = document.getElementById('arkHeatmapLocation')
  const width = document.documentElement.scrollWidth
  const height = document.documentElement.scrollHeight
  arkHeatmapLocation.style.width = width + 'px'
  arkHeatmapLocation.style.height = height + 'px'
  const canvas = arkHeatmapLocation.querySelector('canvas')
  if (canvas) {
    canvas.width = width
    canvas.height = height
  }

  if (heatmap) {
    heatmap.setDimensions(width, height)
  }
}

// 热图展示与隐藏
export function heatmapDisplay () {
  document.getElementById('arkHeatmapLocation').style.display = 
  (heatConfig.heatMapShow && heatConfig.heatMapType === 'location') ? 'block' : 'none'
}

export function emptyHeatmap () {
  document.getElementById('arkHeatmapLocation').style.display = 'none'
}

// 渲染热图
export function renderHeatmap (data) {
  setHeatMapSize()
  heatmapDisplay()
  if (!heatmap) {
    heatmap = h337.create({
      container: document.getElementById('arkHeatmapLocation'),
      radius: 15,
      gradient: {
        0: '#3023ae',
        0.2: '#53a0fd',
        0.4: '#b4ec51',
        0.8: '#ffa301',
        1: '#fb0000'
      },
      backgroundColor: `rgba(0,0,0,${1 - displayConfig.backgroundTransparent})`,
      maxOpacity: 0.65,
      minOpacity: 0.2
    })
  }
  
  const point = []

  const pageWidth = document.documentElement.scrollWidth

  for (let i = 0; i < data.length; i++) {
    const o = data[i]
    const el = useElementXpath(o.$element_path)[0]

    if (!el) {
      continue
    }

    const eleXPostion = getEleOffset(el)

    if (!eleXPostion || eleXPostion.hidden) {
      continue
    }

    // 比例
    const proportion = pageWidth / o.$page_width

    point.push({
      x: eleXPostion.left + Math.ceil(o.$element_x * proportion),
      y: eleXPostion.top + o.$element_y,
      value: 1
    })
  }

  heatmap.setData({
    min: 0,
    max: 10,
    data: point
  })
}

// 修改热图配置
export function setHeatMapConfig() {
  heatmap.configure({
    backgroundColor: `rgba(0,0,0,${1 - displayConfig.backgroundTransparent})`,
    gradient: resetGradient(displayConfig.max, displayConfig.min)
  })
}


let renderTime = null
export function resetRenderHeatMap () {
  clearTimeout(renderTime)
  renderTime = setTimeout(function() {
    if (heatMapData) {
      emptyHeatmap()
      renderHeatmap(heatMapData)
    }
  }, 200)
}


export function heatMapResize () {
  window.addEventListener('resize', function() {
    resetRenderHeatMap()
  })
}

heatMapResize()
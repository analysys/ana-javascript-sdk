import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript'
import replace from 'rollup-plugin-replace'
import path from 'path'
import dotenv from 'dotenv'
import postcss from 'rollup-plugin-postcss'
import es3 from 'rollup-plugin-es3';
import scss from 'rollup-plugin-scss'

// 加载.env文件
dotenv.config()

// 判断是否开发环境
const isDev = process.env.NODE_ENV === 'development'

// 根据环境加载对应的.env.xx文件
dotenv.config({
  override: true,
  path: path.join(__dirname, isDev ? '.env.development' : '.env.production')
})

const pathResolve = p => path.join(__dirname, p)

function changePath() {
  return {
    name: 'changePath',
    transform: function transform(code, id) {
      code = code
        .replace(/\$ANS/g, process.env.ANS)
        .replace(/\$LIB/g, process.env.LIB)
        .replace(/\$LibVERSION/g, process.env.LibVERSION)
      return {
        code: code,
        id: id,
      }
    },
  }
}

function getPlugins () {
  return [
    changePath(),
    scss(),
    postcss({
      extensions: ['.css']
    }),
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: ['src/**'],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    !isDev && terser({
      mangle: {
        toplevel: true,
      },
    })
  ]
}

const outputPath = ['./dist/', './demo/vue-pc/public/sdk/', './demo/react/public/sdk/', './demo/jquery/sdk/']
const outputFile = [{
  file: 'AnalysysAgent_JS_SDK.min.js',
  format: 'umd',
  name: 'AnalysysAgent'
},{
  file: 'AnalysysAgent_JS_SDK.amd.min.js',
  format: 'amd',
  name: 'AnalysysAgent'
},{
  file: 'AnalysysAgent_JS_SDK.es6.min.js',
  format: 'esm',
  name: 'AnalysysAgent'
}]

const output = () => {
  let arr = []
  outputPath.forEach(o => {
    outputFile.forEach(v => {
      arr.push({
        file: o + v.file,
        format: v.format,
        name: v.name
      })
    })
  })
  return arr
}

export default [{
  input: './src/index.ts',
  output: output(),
  plugins: getPlugins(),
  sourceMap: true,
}, {
  input: './src/plugIn/heatmap/index.ts',
  output: [{
    file: './dist/AnalysysAgent_JS_SDK_HEATMAP.min.js',
    format: 'iife',
    name: 'HEATMAP',
    freeze: false
  }, {
    file: './demo/vue-pc/public/sdk/AnalysysAgent_JS_SDK_HEATMAP.min.js',
    format: 'iife',
    name: 'HEATMAP',
    freeze: false
  }, {
    file: './demo/jquery/sdk/AnalysysAgent_JS_SDK_HEATMAP.min.js',
    format: 'iife',
    name: 'HEATMAP',
    freeze: false
  }],
  plugins: getPlugins()
}, {
  input: './src/plugIn/visual/visualShow/index.js',
  output: [{
    file: './dist/AnalysysAgent_JS_SDK_VISUAL.min.js',
    format: 'iife',
    name: 'VISUAL',
    freeze: false
  }, {
    file: './demo/vue-pc/public/sdk/AnalysysAgent_JS_SDK_VISUAL.min.js',
    format: 'iife',
    name: 'VISUAL',
    freeze: false
  }, {
    file: './demo/jquery/sdk/AnalysysAgent_JS_SDK_VISUAL.min.js',
    format: 'iife',
    name: 'VISUAL',
    freeze: false
  }],
  plugins: getPlugins()
}]
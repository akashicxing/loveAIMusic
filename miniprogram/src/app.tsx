import { Component } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App(props) {

  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return props.children
}

export default App
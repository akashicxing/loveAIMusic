import { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Index extends Component {

  componentDidMount () {
    console.log('首页加载完成')
  }

  // 开始创作
  startCreation = () => {
    Taro.navigateTo({
      url: '/pages/create/create'
    })
  }

  // 查看作品
  viewWorks = () => {
    Taro.switchTab({
      url: '/pages/works/works'
    })
  }

  // 用户登录
  handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/login'
    })
  }

  render () {
    return (
      <View className='index'>
        <View className='hero-section'>
          <View className='hero-content'>
            <Text className='hero-title'>为爱而歌</Text>
            <Text className='hero-subtitle'>AI情歌创作平台</Text>
            <Text className='hero-description'>
              用AI为你的爱情故事创作专属情歌
            </Text>
          </View>
          
          <View className='hero-image'>
            <Text className='hero-icon'>🎵</Text>
          </View>
        </View>

        <View className='action-section'>
          <Button 
            className='btn-primary main-action'
            onClick={this.startCreation}
          >
            开始创作
          </Button>
          
          <Button 
            className='btn-secondary'
            onClick={this.viewWorks}
          >
            我的作品
          </Button>
        </View>

        <View className='features-section'>
          <View className='feature-card'>
            <Text className='feature-icon'>✨</Text>
            <Text className='feature-title'>AI智能创作</Text>
            <Text className='feature-desc'>基于你的故事生成专属歌词</Text>
          </View>
          
          <View className='feature-card'>
            <Text className='feature-icon'>🎼</Text>
            <Text className='feature-title'>多种风格</Text>
            <Text className='feature-desc'>流行、民谣、摇滚等多种音乐风格</Text>
          </View>
          
          <View className='feature-card'>
            <Text className='feature-icon'>💝</Text>
            <Text className='feature-title'>专属定制</Text>
            <Text className='feature-desc'>为你的爱情故事量身定制</Text>
          </View>
        </View>

        <View className='login-section'>
          <Button 
            className='btn-secondary'
            onClick={this.handleLogin}
          >
            微信登录
          </Button>
        </View>
      </View>
    )
  }
}

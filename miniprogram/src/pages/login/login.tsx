import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './login.scss'

export default class Login extends Component {

  // 微信登录
  handleWeChatLogin = async () => {
    try {
      // 获取用户信息
      const userInfo = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      // 获取登录凭证
      const loginRes = await Taro.login()
      
      if (loginRes.code) {
        // 调用后端API进行登录
        const response = await Taro.request({
          url: 'https://aimusic.sale/api/auth/wechat',
          method: 'POST',
          data: {
            code: loginRes.code,
            userInfo: userInfo.userInfo
          }
        })
        
        if (response.data.success) {
          // 保存用户信息
          Taro.setStorageSync('userInfo', response.data.data)
          Taro.setStorageSync('token', response.data.data.token)
          
          Taro.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 返回上一页或跳转到首页
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          Taro.showToast({
            title: response.data.message || '登录失败',
            icon: 'error'
          })
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'error'
      })
    }
  }

  // 返回首页
  goBack = () => {
    Taro.navigateBack()
  }

  render () {
    return (
      <View className='login'>
        <View className='login-header'>
          <Text className='login-title'>欢迎使用</Text>
          <Text className='login-subtitle'>为爱而歌</Text>
          <Text className='login-desc'>使用微信登录，开始创作专属情歌</Text>
        </View>

        <View className='login-content'>
          <View className='login-icon'>
            <Text className='wechat-icon'>💚</Text>
          </View>
          
          <Button 
            className='btn-primary wechat-login-btn'
            onClick={this.handleWeChatLogin}
          >
            微信授权登录
          </Button>
          
          <View className='login-tips'>
            <Text className='tips-text'>
              首次使用将自动创建账户
            </Text>
            <Text className='tips-text'>
              我们承诺保护您的隐私信息
            </Text>
          </View>
        </View>

        <View className='login-footer'>
          <Button 
            className='btn-secondary back-btn'
            onClick={this.goBack}
          >
            返回首页
          </Button>
        </View>
      </View>
    )
  }
}

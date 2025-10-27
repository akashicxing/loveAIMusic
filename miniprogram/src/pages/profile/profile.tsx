import { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './profile.scss'

export default class Profile extends Component {

  state = {
    userInfo: null,
    vipStatus: null
  }

  componentDidMount() {
    this.loadUserInfo()
  }

  // 加载用户信息
  loadUserInfo = async () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      const token = Taro.getStorageSync('token')
      
      if (userInfo && token) {
        this.setState({ userInfo })
        
        // 获取VIP状态
        const response = await Taro.request({
          url: 'https://aimusic.sale/api/user/vip-status',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.success) {
          this.setState({
            vipStatus: response.data.data
          })
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  // 退出登录
  logout = async () => {
    const result = await Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？'
    })
    
    if (result.confirm) {
      // 清除本地存储
      Taro.removeStorageSync('userInfo')
      Taro.removeStorageSync('token')
      
      Taro.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      
      // 跳转到登录页
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
    }
  }

  // 查看VIP详情
  viewVipDetails = () => {
    Taro.showModal({
      title: 'VIP特权',
      content: 'VIP用户可以享受更多创作次数和高级功能',
      showCancel: false
    })
  }

  // 联系客服
  contactService = () => {
    Taro.showModal({
      title: '联系客服',
      content: '如有问题请联系客服微信：loveaimusic',
      showCancel: false
    })
  }

  // 关于我们
  aboutUs = () => {
    Taro.showModal({
      title: '关于我们',
      content: '为爱而歌 - AI情歌创作平台\n\n用AI为你的爱情故事创作专属情歌',
      showCancel: false
    })
  }

  render () {
    const { userInfo, vipStatus } = this.state
    
    return (
      <View className='profile'>
        <View className='profile-header'>
          <View className='user-info'>
            {userInfo?.avatarUrl ? (
              <Image 
                className='user-avatar'
                src={userInfo.avatarUrl}
              />
            ) : (
              <View className='user-avatar default-avatar'>
                <Text className='avatar-text'>👤</Text>
              </View>
            )}
            
            <View className='user-details'>
              <Text className='user-name'>
                {userInfo?.nickName || '未登录'}
              </Text>
              <Text className='user-desc'>
                {vipStatus?.vipLevel === 'vip' ? 'VIP用户' : '普通用户'}
              </Text>
            </View>
          </View>
          
          {vipStatus?.vipLevel === 'vip' && (
            <View className='vip-badge'>
              <Text className='vip-text'>VIP</Text>
            </View>
          )}
        </View>

        <View className='profile-content'>
          <View className='stats-section'>
            <View className='stat-item'>
              <Text className='stat-number'>
                {vipStatus?.credits || 0}
              </Text>
              <Text className='stat-label'>剩余积分</Text>
            </View>
            
            <View className='stat-item'>
              <Text className='stat-number'>
                {vipStatus?.totalWorks || 0}
              </Text>
              <Text className='stat-label'>创作作品</Text>
            </View>
            
            <View className='stat-item'>
              <Text className='stat-number'>
                {vipStatus?.totalDays || 0}
              </Text>
              <Text className='stat-label'>使用天数</Text>
            </View>
          </View>

          <View className='menu-section'>
            <View className='menu-item' onClick={this.viewVipDetails}>
              <Text className='menu-icon'>👑</Text>
              <Text className='menu-text'>VIP特权</Text>
              <Text className='menu-arrow'>›</Text>
            </View>
            
            <View className='menu-item' onClick={this.contactService}>
              <Text className='menu-icon'>💬</Text>
              <Text className='menu-text'>联系客服</Text>
              <Text className='menu-arrow'>›</Text>
            </View>
            
            <View className='menu-item' onClick={this.aboutUs}>
              <Text className='menu-icon'>ℹ️</Text>
              <Text className='menu-text'>关于我们</Text>
              <Text className='menu-arrow'>›</Text>
            </View>
          </View>
        </View>

        <View className='profile-footer'>
          <Button 
            className='btn-secondary logout-btn'
            onClick={this.logout}
          >
            退出登录
          </Button>
        </View>
      </View>
    )
  }
}

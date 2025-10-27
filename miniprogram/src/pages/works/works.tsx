import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './works.scss'

export default class Works extends Component {

  state = {
    works: [],
    loading: false,
    currentPlaying: null
  }

  componentDidMount() {
    this.loadWorks()
  }

  // 加载作品列表
  loadWorks = async () => {
    this.setState({ loading: true })
    
    try {
      const token = Taro.getStorageSync('token')
      const response = await Taro.request({
        url: 'https://aimusic.sale/api/works/list',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        this.setState({
          works: response.data.data || [],
          loading: false
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('加载作品失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setState({ loading: false })
    }
  }

  // 播放音乐
  playMusic = (workId, musicUrl) => {
    const { currentPlaying } = this.state
    
    if (currentPlaying === workId) {
      // 停止播放
      Taro.stopBackgroundAudio()
      this.setState({ currentPlaying: null })
    } else {
      // 开始播放
      Taro.playBackgroundAudio({
        dataUrl: musicUrl,
        title: '为爱而歌',
        success: () => {
          this.setState({ currentPlaying: workId })
        },
        fail: (error) => {
          console.error('播放失败:', error)
          Taro.showToast({
            title: '播放失败',
            icon: 'error'
          })
        }
      })
    }
  }

  // 分享作品
  shareWork = (work) => {
    Taro.showShareMenu({
      withShareTicket: true,
      success: () => {
        Taro.showToast({
          title: '分享成功',
          icon: 'success'
        })
      }
    })
  }

  // 删除作品
  deleteWork = async (workId) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个作品吗？'
    })
    
    if (result.confirm) {
      try {
        const token = Taro.getStorageSync('token')
        const response = await Taro.request({
          url: `https://aimusic.sale/api/works/${workId}`,
          method: 'DELETE',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.success) {
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // 重新加载作品列表
          this.loadWorks()
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('删除失败:', error)
        Taro.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    }
  }

  // 开始创作
  startCreation = () => {
    Taro.switchTab({
      url: '/pages/create/create'
    })
  }

  renderWorkItem = (work) => {
    const { currentPlaying } = this.state
    const isPlaying = currentPlaying === work.id
    
    return (
      <View key={work.id} className='work-item'>
        <View className='work-header'>
          <Text className='work-title'>{work.title}</Text>
          <Text className='work-date'>{work.createdAt}</Text>
        </View>
        
        <View className='work-content'>
          <Text className='work-lyrics'>{work.lyrics}</Text>
        </View>
        
        <View className='work-actions'>
          {work.musicUrl && (
            <Button 
              className={`action-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => this.playMusic(work.id, work.musicUrl)}
            >
              {isPlaying ? '⏸️' : '▶️'} {isPlaying ? '暂停' : '播放'}
            </Button>
          )}
          
          <Button 
            className='action-btn'
            onClick={() => this.shareWork(work)}
          >
            📤 分享
          </Button>
          
          <Button 
            className='action-btn delete-btn'
            onClick={() => this.deleteWork(work.id)}
          >
            🗑️ 删除
          </Button>
        </View>
      </View>
    )
  }

  render () {
    const { works, loading } = this.state
    
    return (
      <View className='works'>
        <View className='works-header'>
          <Text className='works-title'>我的作品</Text>
          <Button 
            className='btn-primary create-btn'
            onClick={this.startCreation}
          >
            开始创作
          </Button>
        </View>

        <ScrollView className='works-content' scrollY>
          {loading ? (
            <View className='loading'>
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : works.length > 0 ? (
            <View className='works-list'>
              {works.map(work => this.renderWorkItem(work))}
            </View>
          ) : (
            <View className='empty-state'>
              <Text className='empty-icon'>🎵</Text>
              <Text className='empty-text'>还没有作品</Text>
              <Text className='empty-desc'>开始创作你的第一首情歌吧</Text>
              <Button 
                className='btn-primary'
                onClick={this.startCreation}
              >
                开始创作
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}

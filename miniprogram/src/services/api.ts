import Taro from '@tarojs/taro'

// API基础配置
const API_BASE_URL = 'https://aimusic.sale/api'

// 请求拦截器
const request = (options: any) => {
  return new Promise((resolve, reject) => {
    // 添加token
    const token = Taro.getStorageSync('token')
    if (token) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }

    // 添加基础URL
    if (!options.url.startsWith('http')) {
      options.url = API_BASE_URL + options.url
    }

    Taro.request({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

// 用户相关API
export const userAPI = {
  // 微信登录
  wechatLogin: (code: string, userInfo: any) => {
    return request({
      url: '/auth/wechat',
      method: 'POST',
      data: { code, userInfo }
    })
  },

  // 获取用户信息
  getUserInfo: () => {
    return request({
      url: '/user/info',
      method: 'GET'
    })
  },

  // 获取VIP状态
  getVipStatus: () => {
    return request({
      url: '/user/vip-status',
      method: 'GET'
    })
  },

  // VIP试用
  vipTrial: (trialCode: string) => {
    return request({
      url: '/user/vip-trial',
      method: 'POST',
      data: { trialCode }
    })
  }
}

// AI相关API
export const aiAPI = {
  // 生成歌词
  generateLyrics: (answers: any) => {
    return request({
      url: '/ai/generate-basic-lyrics',
      method: 'POST',
      data: { answers }
    })
  },

  // 生成音乐
  generateMusic: (lyrics: any, style: any) => {
    return request({
      url: '/ai/generate-music',
      method: 'POST',
      data: { lyrics, style }
    })
  },

  // 获取生成状态
  getGenerationStatus: (taskId: string) => {
    return request({
      url: `/ai/generation-status/${taskId}`,
      method: 'GET'
    })
  }
}

// 作品相关API
export const worksAPI = {
  // 获取作品列表
  getWorksList: () => {
    return request({
      url: '/works/list',
      method: 'GET'
    })
  },

  // 获取作品详情
  getWorkDetail: (workId: string) => {
    return request({
      url: `/works/${workId}`,
      method: 'GET'
    })
  },

  // 保存作品
  saveWork: (workData: any) => {
    return request({
      url: '/works/save',
      method: 'POST',
      data: workData
    })
  },

  // 删除作品
  deleteWork: (workId: string) => {
    return request({
      url: `/works/${workId}`,
      method: 'DELETE'
    })
  },

  // 分享作品
  shareWork: (workId: string, platform: string) => {
    return request({
      url: '/works/share',
      method: 'POST',
      data: { workId, platform }
    })
  }
}

// 工具函数
export const apiUtils = {
  // 处理API错误
  handleError: (error: any) => {
    console.error('API Error:', error)
    
    let message = '请求失败'
    if (error.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    Taro.showToast({
      title: message,
      icon: 'error'
    })
  },

  // 显示成功消息
  showSuccess: (message: string) => {
    Taro.showToast({
      title: message,
      icon: 'success'
    })
  },

  // 显示加载中
  showLoading: (title: string = '加载中...') => {
    Taro.showLoading({ title })
  },

  // 隐藏加载中
  hideLoading: () => {
    Taro.hideLoading()
  }
}

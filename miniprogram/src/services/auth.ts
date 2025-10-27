import Taro from '@tarojs/taro'
import { userAPI, apiUtils } from './api'

export interface UserInfo {
  id: string
  nickname: string
  avatarUrl?: string
  openid: string
  unionid?: string
  vipLevel: 'free' | 'vip'
  credits: number
  expiresAt?: string
}

export interface VipStatus {
  vipLevel: 'free' | 'vip'
  credits: number
  totalWorks: number
  totalDays: number
  expiresAt?: string
}

class AuthService {
  private userInfo: UserInfo | null = null
  private vipStatus: VipStatus | null = null

  // 初始化
  async init() {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      const token = Taro.getStorageSync('token')
      
      if (userInfo && token) {
        this.userInfo = userInfo
        await this.loadVipStatus()
      }
    } catch (error) {
      console.error('Auth init error:', error)
    }
  }

  // 微信登录
  async wechatLogin(): Promise<boolean> {
    try {
      // 获取用户信息
      const userInfo = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      // 获取登录凭证
      const loginRes = await Taro.login()
      
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }

      // 调用后端API
      const response = await userAPI.wechatLogin(loginRes.code, userInfo.userInfo)
      
      if (response.success) {
        // 保存用户信息
        this.userInfo = response.data
        Taro.setStorageSync('userInfo', this.userInfo)
        Taro.setStorageSync('token', response.data.token)
        
        // 加载VIP状态
        await this.loadVipStatus()
        
        apiUtils.showSuccess('登录成功')
        return true
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      apiUtils.handleError(error)
      return false
    }
  }

  // 加载VIP状态
  async loadVipStatus(): Promise<void> {
    try {
      const response = await userAPI.getVipStatus()
      if (response.success) {
        this.vipStatus = response.data
      }
    } catch (error) {
      console.error('Load VIP status error:', error)
    }
  }

  // 检查登录状态
  isLoggedIn(): boolean {
    return !!this.userInfo && !!Taro.getStorageSync('token')
  }

  // 获取用户信息
  getUserInfo(): UserInfo | null {
    return this.userInfo
  }

  // 获取VIP状态
  getVipStatus(): VipStatus | null {
    return this.vipStatus
  }

  // 检查VIP权限
  checkVipPermission(): boolean {
    return this.vipStatus?.vipLevel === 'vip'
  }

  // 检查积分是否足够
  checkCredits(required: number = 20): boolean {
    return (this.vipStatus?.credits || 0) >= required
  }

  // VIP试用
  async vipTrial(trialCode: string): Promise<boolean> {
    try {
      const response = await userAPI.vipTrial(trialCode)
      
      if (response.success) {
        apiUtils.showSuccess(response.message)
        await this.loadVipStatus()
        return true
      } else {
        throw new Error(response.message || '试用失败')
      }
    } catch (error) {
      apiUtils.handleError(error)
      return false
    }
  }

  // 退出登录
  logout(): void {
    this.userInfo = null
    this.vipStatus = null
    Taro.removeStorageSync('userInfo')
    Taro.removeStorageSync('token')
  }

  // 跳转到登录页
  navigateToLogin(): void {
    Taro.navigateTo({
      url: '/pages/login/login'
    })
  }

  // 检查登录并跳转
  checkLoginAndNavigate(url: string): void {
    if (this.isLoggedIn()) {
      Taro.navigateTo({ url })
    } else {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后再使用此功能',
        success: (res) => {
          if (res.confirm) {
            this.navigateToLogin()
          }
        }
      })
    }
  }
}

// 创建单例
export const authService = new AuthService()

// 导出类型
export type { UserInfo, VipStatus }

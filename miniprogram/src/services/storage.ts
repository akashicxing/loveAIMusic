import Taro from '@tarojs/taro'

// 存储键名常量
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  TOKEN: 'token',
  ANSWERS: 'answers',
  LYRICS: 'lyrics',
  SELECTED_STYLE: 'selectedStyle',
  MUSIC: 'music',
  WORKS_CACHE: 'worksCache',
  SETTINGS: 'settings'
} as const

class StorageService {
  // 设置数据
  set(key: string, data: any): void {
    try {
      Taro.setStorageSync(key, data)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  // 获取数据
  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const data = Taro.getStorageSync(key)
      return data || defaultValue || null
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue || null
    }
  }

  // 删除数据
  remove(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  // 清空所有数据
  clear(): void {
    try {
      Taro.clearStorageSync()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  // 获取存储信息
  getInfo(): Promise<any> {
    return Taro.getStorageInfo()
  }

  // 异步设置数据
  async setAsync(key: string, data: any): Promise<void> {
    try {
      await Taro.setStorage({ key, data })
    } catch (error) {
      console.error('Storage setAsync error:', error)
    }
  }

  // 异步获取数据
  async getAsync<T = any>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const res = await Taro.getStorage({ key })
      return res.data || defaultValue || null
    } catch (error) {
      console.error('Storage getAsync error:', error)
      return defaultValue || null
    }
  }

  // 异步删除数据
  async removeAsync(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key })
    } catch (error) {
      console.error('Storage removeAsync error:', error)
    }
  }

  // 创作流程相关方法
  saveAnswers(answers: any): void {
    this.set(STORAGE_KEYS.ANSWERS, answers)
  }

  getAnswers(): any {
    return this.get(STORAGE_KEYS.ANSWERS, {})
  }

  saveLyrics(lyrics: any): void {
    this.set(STORAGE_KEYS.LYRICS, lyrics)
  }

  getLyrics(): any {
    return this.get(STORAGE_KEYS.LYRICS)
  }

  saveSelectedStyle(style: any): void {
    this.set(STORAGE_KEYS.SELECTED_STYLE, style)
  }

  getSelectedStyle(): any {
    return this.get(STORAGE_KEYS.SELECTED_STYLE)
  }

  saveMusic(music: any): void {
    this.set(STORAGE_KEYS.MUSIC, music)
  }

  getMusic(): any {
    return this.get(STORAGE_KEYS.MUSIC)
  }

  // 清空创作数据
  clearCreationData(): void {
    this.remove(STORAGE_KEYS.ANSWERS)
    this.remove(STORAGE_KEYS.LYRICS)
    this.remove(STORAGE_KEYS.SELECTED_STYLE)
    this.remove(STORAGE_KEYS.MUSIC)
  }

  // 作品缓存
  saveWorksCache(works: any[]): void {
    this.set(STORAGE_KEYS.WORKS_CACHE, {
      data: works,
      timestamp: Date.now()
    })
  }

  getWorksCache(maxAge: number = 5 * 60 * 1000): any[] | null {
    const cache = this.get(STORAGE_KEYS.WORKS_CACHE)
    if (!cache) return null

    const { data, timestamp } = cache
    if (Date.now() - timestamp > maxAge) {
      this.remove(STORAGE_KEYS.WORKS_CACHE)
      return null
    }

    return data
  }

  // 设置相关
  saveSettings(settings: any): void {
    this.set(STORAGE_KEYS.SETTINGS, settings)
  }

  getSettings(): any {
    return this.get(STORAGE_KEYS.SETTINGS, {})
  }
}

// 创建单例
export const storageService = new StorageService()

// 导出常量
export { STORAGE_KEYS }

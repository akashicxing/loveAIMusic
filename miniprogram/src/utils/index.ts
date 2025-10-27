// 时间格式化
export const formatTime = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }

  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时长
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 生成随机ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

// 验证邮箱
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证手机号
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 截取文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

// 获取URL参数
export const getUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const urlObj = new URL(url)
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

// 音乐风格选项
export const MUSIC_STYLES = [
  { id: 'pop', name: '流行', description: '现代流行音乐风格' },
  { id: 'folk', name: '民谣', description: '清新民谣风格' },
  { id: 'rock', name: '摇滚', description: '动感摇滚风格' },
  { id: 'jazz', name: '爵士', description: '优雅爵士风格' },
  { id: 'classical', name: '古典', description: '经典古典风格' },
  { id: 'electronic', name: '电子', description: '现代电子风格' }
] as const

// 问题模板
export const QUESTION_TEMPLATES = [
  {
    id: 'meet',
    question: '你们是怎么认识的？',
    options: [
      { value: 'friend', label: '朋友介绍' },
      { value: 'work', label: '工作同事' },
      { value: 'online', label: '网络认识' },
      { value: 'school', label: '同学关系' },
      { value: 'other', label: '其他方式' }
    ]
  },
  {
    id: 'first_impression',
    question: '第一次见面时，你对TA的印象是？',
    options: [
      { value: 'gentle', label: '温柔体贴' },
      { value: 'humorous', label: '幽默风趣' },
      { value: 'handsome', label: '帅气/美丽' },
      { value: 'smart', label: '聪明睿智' },
      { value: 'special', label: '特别的感觉' }
    ]
  },
  {
    id: 'favorite_moment',
    question: '你们最难忘的时光是？',
    options: [
      { value: 'first_date', label: '第一次约会' },
      { value: 'travel', label: '一起旅行' },
      { value: 'celebration', label: '庆祝节日' },
      { value: 'daily', label: '日常相处' },
      { value: 'surprise', label: '意外惊喜' }
    ]
  }
] as const

// 常量
export const CONSTANTS = {
  MAX_LYRICS_LENGTH: 500,
  MAX_TITLE_LENGTH: 50,
  DEFAULT_CREDITS_PER_GENERATION: 20,
  CACHE_EXPIRE_TIME: 5 * 60 * 1000, // 5分钟
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'm4a'],
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif']
} as const

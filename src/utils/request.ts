import { http } from '@/utils/request'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: any
  data?: any
  headers?: any
  timeout?: number
}

export interface ResponseData {
  code: number
  message: string
  data: any
  timestamp: number
}

class Request {
  private baseURL: string
  private timeout: number
  private headers: any

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080' 
      : 'https://api.diaoyanshe.com'
    this.timeout = 10000
    this.headers = {
      'Content-Type': 'application/json'
    }
  }

  // 请求拦截器
  private interceptRequest(options: RequestOptions): RequestOptions {
    // 添加token
    const token = uni.getStorageSync('token')
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    }
    
    return options
  }

  // 响应拦截器
  private interceptResponse(response: any): any {
    if (response.statusCode === 401) {
      // token过期，清除本地存储并跳转到登录页
      uni.removeStorageSync('token')
      uni.reLaunch({ url: '/pages/index/index' })
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    
    if (response.statusCode >= 400) {
      return Promise.reject(new Error(response.data?.message || '请求失败'))
    }
    
    return response.data
  }

  // 基础请求方法
  private async request(url: string, options: RequestOptions = {}): Promise<ResponseData> {
    options = this.interceptRequest(options)
    
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + url,
        method: options.method || 'GET',
        data: options.data || options.params,
        header: {
          ...this.headers,
          ...options.headers
        },
        timeout: options.timeout || this.timeout,
        success: (response) => {
          try {
            const result = this.interceptResponse(response)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(new Error('网络连接失败，请检查网络设置'))
        }
      })
    })
  }

  // GET请求
  get(url: string, options: RequestOptions = {}): Promise<ResponseData> {
    return this.request(url, { ...options, method: 'GET' })
  }

  // POST请求
  post(url: string, data?: any, options: RequestOptions = {}): Promise<ResponseData> {
    return this.request(url, { ...options, method: 'POST', data })
  }

  // PUT请求
  put(url: string, data?: any, options: RequestOptions = {}): Promise<ResponseData> {
    return this.request(url, { ...options, method: 'PUT', data })
  }

  // DELETE请求
  delete(url: string, options: RequestOptions = {}): Promise<ResponseData> {
    return this.request(url, { ...options, method: 'DELETE' })
  }

  // 上传文件
  upload(url: string, filePath: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      
      uni.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: options.name || 'file',
        formData: options.formData || {},
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (response) => {
          if (response.statusCode === 200) {
            try {
              const data = JSON.parse(response.data)
              resolve(data)
            } catch (error) {
              resolve(response.data)
            }
          } else {
            reject(new Error('上传失败'))
          }
        },
        fail: (error) => {
          console.error('上传失败:', error)
          reject(new Error('上传失败，请检查网络连接'))
        }
      })
    })
  }
}

// 创建请求实例
export const http = new Request()

export default http
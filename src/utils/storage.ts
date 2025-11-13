export const useStorage = () => {
  // 设置缓存
  const set = (key: string, data: any, expireTime?: number): void => {
    try {
      const cacheData = {
        data,
        expireTime: expireTime ? Date.now() + expireTime : null,
        createTime: Date.now()
      }
      uni.setStorageSync(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  }

  // 获取缓存
  const get = (key: string): any => {
    try {
      const cacheData = uni.getStorageSync(key)
      if (!cacheData) return null
      
      const parsed = JSON.parse(cacheData)
      
      // 检查是否过期
      if (parsed.expireTime && Date.now() > parsed.expireTime) {
        remove(key)
        return null
      }
      
      return parsed.data
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  // 删除缓存
  const remove = (key: string): void => {
    try {
      uni.removeStorageSync(key)
    } catch (error) {
      console.error('删除缓存失败:', error)
    }
  }

  // 清空所有缓存
  const clear = (): void => {
    try {
      uni.clearStorageSync()
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  }

  // 获取缓存信息
  const getStorageInfo = (): Promise<UniApp.GetStorageInfoSuccess> => {
    return new Promise((resolve, reject) => {
      uni.getStorageInfo({
        success: resolve,
        fail: reject
      })
    })
  }

  // 异步设置缓存
  const setAsync = (key: string, data: any, expireTime?: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cacheData = {
        data,
        expireTime: expireTime ? Date.now() + expireTime : null,
        createTime: Date.now()
      }
      
      uni.setStorage({
        key,
        data: JSON.stringify(cacheData),
        success: () => resolve(),
        fail: (error) => reject(error)
      })
    })
  }

  // 异步获取缓存
  const getAsync = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      uni.getStorage({
        key,
        success: (res) => {
          try {
            const parsed = JSON.parse(res.data)
            
            // 检查是否过期
            if (parsed.expireTime && Date.now() > parsed.expireTime) {
              remove(key)
              resolve(null)
              return
            }
            
            resolve(parsed.data)
          } catch (error) {
            reject(error)
          }
        },
        fail: () => resolve(null)
      })
    })
  }

  return {
    set,
    get,
    remove,
    clear,
    getStorageInfo,
    setAsync,
    getAsync
  }
}

export default useStorage
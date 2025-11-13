export const useLocation = () => {
  // 获取当前位置
  const getCurrentLocation = (): Promise<{
    latitude: number
    longitude: number
    address?: string
  }> => {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address
          })
        },
        fail: (error) => {
          console.error('获取位置失败:', error)
          reject(new Error('获取位置失败，请检查定位权限'))
        }
      })
    })
  }

  // 选择位置
  const chooseLocation = (): Promise<{
    latitude: number
    longitude: number
    name: string
    address: string
  }> => {
    return new Promise((resolve, reject) => {
      uni.chooseLocation({
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name,
            address: res.address
          })
        },
        fail: (error) => {
          console.error('选择位置失败:', error)
          reject(new Error('选择位置失败'))
        }
      })
    })
  }

  // 打开地图
  const openLocation = (latitude: number, longitude: number, name?: string, address?: string) => {
    uni.openLocation({
      latitude,
      longitude,
      name: name || '位置',
      address: address || '',
      success: () => {
        console.log('打开地图成功')
      },
      fail: (error) => {
        console.error('打开地图失败:', error)
      }
    })
  }

  // 计算两点间距离（米）
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 格式化距离
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }

  // 检查定位权限
  const checkLocationAuth = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      uni.getSetting({
        success: (res) => {
          const locationAuth = res.authSetting['scope.userLocation']
          resolve(locationAuth === true)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  // 请求定位权限
  const requestLocationAuth = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      uni.authorize({
        scope: 'scope.userLocation',
        success: () => {
          resolve(true)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  return {
    getCurrentLocation,
    chooseLocation,
    openLocation,
    calculateDistance,
    formatDistance,
    checkLocationAuth,
    requestLocationAuth
  }
}
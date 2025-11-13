import { http } from '@/utils/request'
import type { FishingSpot } from '@/types'

interface SpotState {
  spots: FishingSpot[]
  currentSpot: FishingSpot | null
  nearbySpots: FishingSpot[]
  favoriteSpots: FishingSpot[]
  loading: boolean
}

export const useSpotStore = defineStore('spot', () => {
  const state = reactive<SpotState>({
    spots: [],
    currentSpot: null,
    nearbySpots: [],
    favoriteSpots: [],
    loading: false
  })

  // 获取钓点列表
  const fetchSpots = async (params: { lat?: number; lng?: number; radius?: number; page?: number; limit?: number } = {}) => {
    state.loading = true
    try {
      const response = await http.get('/api/v1/spots', { params })
      if (response.code === 200) {
        state.spots = response.data.spots
        return response.data
      }
    } catch (error) {
      console.error('获取钓点列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  // 获取附近钓点
  const fetchNearbySpots = async (lat: number, lng: number, radius = 5000) => {
    state.loading = true
    try {
      const response = await http.get('/api/v1/spots', {
        params: { lat, lng, radius, limit: 20 }
      })
      if (response.code === 200) {
        state.nearbySpots = response.data.spots
        return response.data.spots
      }
    } catch (error) {
      console.error('获取附近钓点失败:', error)
    } finally {
      state.loading = false
    }
  }

  // 获取钓点详情
  const fetchSpotDetail = async (id: string) => {
    state.loading = true
    try {
      const response = await http.get(`/api/v1/spots/${id}`)
      if (response.code === 200) {
        state.currentSpot = response.data
        return response.data
      }
    } catch (error) {
      console.error('获取钓点详情失败:', error)
    } finally {
      state.loading = false
    }
  }

  // 创建钓点
  const createSpot = async (data: {
    name: string
    description?: string
    latitude: number
    longitude: number
    address?: string
    fish_types: string[]
    difficulty: number
    is_free: boolean
    images?: string[]
  }) => {
    try {
      const response = await http.post('/api/v1/spots', data)
      if (response.code === 200) {
        // 刷新钓点列表
        await fetchSpots()
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '创建钓点失败' }
    }
  }

  // 搜索钓点
  const searchSpots = async (keyword: string, location?: string) => {
    state.loading = true
    try {
      const response = await http.get('/api/v1/spots/search', {
        params: { keyword, location }
      })
      if (response.code === 200) {
        state.spots = response.data.spots
        return response.data.spots
      }
    } catch (error) {
      console.error('搜索钓点失败:', error)
    } finally {
      state.loading = false
    }
  }

  // 收藏钓点
  const favoriteSpot = async (spotId: string) => {
    try {
      const response = await http.post(`/api/v1/spots/${spotId}/favorite`)
      if (response.code === 200) {
        // 更新本地状态
        const spot = state.spots.find(s => s.id === spotId)
        if (spot) {
          spot.favorites_count += 1
        }
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '收藏失败' }
    }
  }

  // 取消收藏钓点
  const unfavoriteSpot = async (spotId: string) => {
    try {
      const response = await http.delete(`/api/v1/spots/${spotId}/favorite`)
      if (response.code === 200) {
        // 更新本地状态
        const spot = state.spots.find(s => s.id === spotId)
        if (spot && spot.favorites_count > 0) {
          spot.favorites_count -= 1
        }
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '取消收藏失败' }
    }
  }

  // 获取收藏的钓点
  const fetchFavoriteSpots = async () => {
    state.loading = true
    try {
      const response = await http.get('/api/v1/spots/favorites')
      if (response.code === 200) {
        state.favoriteSpots = response.data.spots
        return response.data.spots
      }
    } catch (error) {
      console.error('获取收藏钓点失败:', error)
    } finally {
      state.loading = false
    }
  }

  // 根据位置筛选钓点
  const filterSpotsByLocation = (lat: number, lng: number, radius = 10000) => {
    return state.spots.filter(spot => {
      const distance = calculateDistance(lat, lng, spot.latitude, spot.longitude)
      return distance <= radius
    })
  }

  // 计算两点间距离（米）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // 获取推荐钓点
  const getRecommendedSpots = async (userId: string) => {
    try {
      const response = await http.get('/api/v1/spots/recommendations', {
        params: { user_id: userId }
      })
      if (response.code === 200) {
        return response.data.spots
      }
    } catch (error) {
      console.error('获取推荐钓点失败:', error)
    }
    return []
  }

  return {
    // state
    spots: readonly(state.spots),
    currentSpot: readonly(state.currentSpot),
    nearbySpots: readonly(state.nearbySpots),
    favoriteSpots: readonly(state.favoriteSpots),
    loading: readonly(state.loading),
    
    // actions
    fetchSpots,
    fetchNearbySpots,
    fetchSpotDetail,
    createSpot,
    searchSpots,
    favoriteSpot,
    unfavoriteSpot,
    fetchFavoriteSpots,
    filterSpotsByLocation,
    getRecommendedSpots
  }
})
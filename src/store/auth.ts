import { http } from '@/utils/request'
import type { User, UserProfile, UserStats } from '@/types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  stats: UserStats | null
  token: string | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const state = reactive<AuthState>({
    user: null,
    profile: null,
    stats: null,
    token: uni.getStorageSync('token') || null,
    isLoggedIn: false
  })

  // 检查登录状态
  const checkLoginStatus = async () => {
    if (!state.token) {
      state.isLoggedIn = false
      return false
    }
    
    try {
      // 验证token有效性
      const response = await http.get('/api/v1/users/profile')
      if (response.code === 200) {
        state.user = response.data
        state.isLoggedIn = true
        return true
      }
    } catch (error) {
      // token无效，清除本地存储
      uni.removeStorageSync('token')
      state.token = null
      state.isLoggedIn = false
    }
    
    return false
  }

  // 用户登录
  const login = async (username: string, password: string) => {
    try {
      const response = await http.post('/api/v1/users/login', {
        username,
        password
      })
      
      if (response.code === 200) {
        const { token, user } = response.data
        state.token = token
        state.user = user
        state.isLoggedIn = true
        
        // 保存token到本地存储
        uni.setStorageSync('token', token)
        
        // 获取用户详细信息和统计数据
        await fetchUserProfile()
        await fetchUserStats()
        
        return { success: true }
      }
      
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 用户注册
  const register = async (userData: {
    username: string
    email: string
    password: string
    phone?: string
  }) => {
    try {
      const response = await http.post('/api/v1/users/register', userData)
      
      if (response.code === 200) {
        // 注册成功后自动登录
        return await login(userData.username, userData.password)
      }
      
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败' }
    }
  }

  // 获取用户资料
  const fetchUserProfile = async () => {
    if (!state.token) return
    
    try {
      const response = await http.get('/api/v1/users/profile')
      if (response.code === 200) {
        state.profile = response.data
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
    }
  }

  // 获取用户统计数据
  const fetchUserStats = async () => {
    if (!state.token) return
    
    try {
      const response = await http.get('/api/v1/users/stats')
      if (response.code === 200) {
        state.stats = response.data
      }
    } catch (error) {
      console.error('获取用户统计数据失败:', error)
    }
  }

  // 更新用户资料
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await http.put('/api/v1/users/profile', data)
      if (response.code === 200) {
        state.profile = { ...state.profile, ...data }
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || '更新失败' }
    }
  }

  // 用户登出
  const logout = () => {
    state.user = null
    state.profile = null
    state.stats = null
    state.token = null
    state.isLoggedIn = false
    
    uni.removeStorageSync('token')
    uni.reLaunch({ url: '/pages/index/index' })
  }

  // 计算属性
  const researchPoints = computed(() => state.profile?.research_points || 0)
  const userLevel = computed(() => state.profile?.level || 1)
  const achievementCount = computed(() => state.profile?.achievement_count || 0)

  return {
    // state
    user: readonly(state.user),
    profile: readonly(state.profile),
    stats: readonly(state.stats),
    token: readonly(state.token),
    isLoggedIn: readonly(state.isLoggedIn),
    
    // computed
    researchPoints,
    userLevel,
    achievementCount,
    
    // actions
    checkLoginStatus,
    login,
    register,
    fetchUserProfile,
    fetchUserStats,
    updateProfile,
    logout
  }
})
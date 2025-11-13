<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar">
        <image 
          :src="authStore.profile?.avatar_url || '/static/default-avatar.png'" 
          mode="aspectFill"
          class="avatar-img"
        />
      </view>
      
      <view class="user-info">
        <text class="username">{{ authStore.profile?.nickname || authStore.user?.username || '未设置昵称' }}</text>
        <text class="user-level">Lv.{{ authStore.userLevel }} {{ getLevelName(authStore.userLevel) }}</text>
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">{{ authStore.researchPoints }}</text>
            <text class="stat-label">研值</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ authStore.achievementCount }}</text>
            <text class="stat-label">成就</text>
          </view>
        </view>
      </view>
      
      <button class="edit-btn" @click="editProfile">
        <text>编辑资料</text>
      </button>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-section">
        <text class="section-title">我的钓研</text>
        
        <view class="menu-item" @click="goToMyLogs">
          <view class="menu-icon">📝</view>
          <text class="menu-text">钓鱼日志</text>
          <text class="menu-badge">{{ authStore.stats?.total_fishing_trips || 0 }}</text>
        </view>
        
        <view class="menu-item" @click="goToMySpots">
          <view class="menu-icon">📍</view>
          <text class="menu-text">我的钓点</text>
          <text class="menu-badge">{{ mySpotsCount }}</text>
        </view>
        
        <view class="menu-item" @click="goToFavorites">
          <view class="menu-icon">⭐</view>
          <text class="menu-text">收藏钓点</text>
          <text class="menu-badge">{{ favoriteSpotsCount }}</text>
        </view>
        
        <view class="menu-item" @click="goToAchievements">
          <view class="menu-icon">🏆</view>
          <text class="menu-text">我的成就</text>
          <text class="menu-badge">{{ authStore.achievementCount }}</text>
        </view>
      </view>
      
      <view class="menu-section">
        <text class="section-title">数据统计</text>
        
        <view class="menu-item" @click="goToStats">
          <view class="menu-icon">📊</view>
          <text class="menu-text">数据分析</text>
        </view>
        
        <view class="menu-item" @click="goToRanking">
          <view class="menu-icon">🏅</view>
          <text class="menu-text">排行榜</text>
        </view>
      </view>
      
      <view class="menu-section">
        <text class="section-title">设置</text>
        
        <view class="menu-item" @click="goToSettings">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">设置</text>
        </view>
        
        <view class="menu-item" @click="goToAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于我们</text>
        </view>
        
        <view class="menu-item logout" @click="handleLogout">
          <view class="menu-icon">🚪</view>
          <text class="menu-text">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useSpotStore } from '@/store/spot'

const authStore = useAuthStore()
const spotStore = useSpotStore()

const mySpotsCount = ref(0)
const favoriteSpotsCount = ref(0)

const getLevelName = (level: number): string => {
  const levelNames = {
    1: '见习钓手',
    2: '初级钓手',
    3: '中级钓手',
    4: '高级钓手',
    5: '钓鱼专家',
    6: '钓鱼大师',
    7: '钓鱼宗师',
    8: '钓鱼传奇',
    9: '钓鱼神话',
    10: '钓鱼至尊'
  }
  return levelNames[level as keyof typeof levelNames] || '未知等级'
}

const editProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

const goToMyLogs = () => {
  uni.navigateTo({
    url: '/pages/log/list'
  })
}

const goToMySpots = () => {
  uni.navigateTo({
    url: '/pages/spot/my'
  })
}

const goToFavorites = () => {
  uni.navigateTo({
    url: '/pages/spot/favorites'
  })
}

const goToAchievements = () => {
  uni.navigateTo({
    url: '/pages/profile/achievements'
  })
}

const goToStats = () => {
  uni.navigateTo({
    url: '/pages/profile/stats'
  })
}

const goToRanking = () => {
  uni.navigateTo({
    url: '/pages/profile/ranking'
  })
}

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/profile/settings'
  })
}

const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/profile/about'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout()
      }
    }
  })
}

const loadCounts = async () => {
  // 这里可以加载用户的钓点数量和收藏数量
  // 暂时使用模拟数据
  mySpotsCount.value = 12
  favoriteSpotsCount.value = 8
}

onMounted(() => {
  loadCounts()
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  position: relative;
  
  .user-avatar {
    margin-right: 30rpx;
    
    .avatar-img {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }
  }
  
  .user-info {
    flex: 1;
    color: white;
    
    .username {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .user-level {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
      margin-bottom: 16rpx;
    }
    
    .user-stats {
      display: flex;
      gap: 40rpx;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          display: block;
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 4rpx;
        }
        
        .stat-label {
          display: block;
          font-size: 20rpx;
          opacity: 0.8;
        }
      }
    }
  }
  
  .edit-btn {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    border-radius: 20rpx;
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    backdrop-filter: blur(10rpx);
    
    &:active {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.menu-list {
  padding: 20rpx;
  
  .menu-section {
    background: white;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    
    .section-title {
      display: block;
      padding: 30rpx 30rpx 20rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #666;
      background: #fafafa;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background: #f9f9f9;
      }
      
      .menu-icon {
        font-size: 36rpx;
        margin-right: 20rpx;
        width: 40rpx;
        text-align: center;
      }
      
      .menu-text {
        flex: 1;
        font-size: 30rpx;
        color: #333;
      }
      
      .menu-badge {
        background: #ff6b6b;
        color: white;
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        min-width: 40rpx;
        text-align: center;
      }
    }
    
    .menu-item.logout {
      .menu-text {
        color: #ff6b6b;
      }
    }
  }
}
</style>
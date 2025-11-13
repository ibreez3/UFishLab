<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">钓研社</text>
      <text class="subtitle">研究每一次出钓，连接每一位钓友</text>
    </view>
    
    <view class="nav-grid">
      <view class="nav-item" @click="navigateTo('/pages/spot/map')">
        <view class="nav-icon">🗺️</view>
        <text class="nav-text">钓点地图</text>
      </view>
      
      <view class="nav-item" @click="navigateTo('/pages/weather/index')">
        <view class="nav-icon">🌤️</view>
        <text class="nav-text">鱼情分析</text>
      </view>
      
      <view class="nav-item" @click="navigateTo('/pages/social/index')">
        <view class="nav-icon">👥</view>
        <text class="nav-text">社区交流</text>
      </view>
      
      <view class="nav-item" @click="navigateTo('/pages/profile/index')">
        <view class="nav-icon">📊</view>
        <text class="nav-text">个人中心</text>
      </view>
    </view>
    
    <view class="quick-actions">
      <button class="action-btn primary" @click="navigateTo('/pages/spot/create')">
        <text>📍 发布钓点</text>
      </button>
      <button class="action-btn secondary" @click="navigateTo('/pages/log/create')">
        <text>📝 记录渔获</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

onLoad(() => {
  console.log('钓研社首页加载完成')
})
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.nav-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .nav-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
  }
  
  .nav-text {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  
  .action-btn {
    flex: 1;
    padding: 24rpx 32rpx;
    border-radius: 50rpx;
    font-size: 28rpx;
    font-weight: 500;
    border: none;
    
    &.primary {
      background: linear-gradient(45deg, #ff6b6b, #ee5a24);
      color: white;
      box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
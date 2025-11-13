<template>
  <view class="map-container">
    <map
      id="spotMap"
      :latitude="centerLatitude"
      :longitude="centerLongitude"
      :scale="scale"
      :markers="markers"
      :show-location="true"
      style="width: 100%; height: 100%;"
      @markertap="onMarkerTap"
      @regionchange="onRegionChange"
    />
    
    <view class="map-controls">
      <button class="location-btn" @click="getCurrentLocation">
        <text>📍</text>
      </button>
      
      <button class="search-btn" @click="showSearch = true">
        <text>🔍</text>
      </button>
    </view>
    
    <view class="spot-list-panel" v-if="showSpotList">
      <view class="panel-header">
        <text>附近钓点 ({{ nearbySpots.length }})</text>
        <button class="close-btn" @click="showSpotList = false">✕</button>
      </view>
      
      <scroll-view scroll-y class="spot-list">
        <view 
          v-for="spot in nearbySpots" 
          :key="spot.id"
          class="spot-item"
          @click="selectSpot(spot)"
        >
          <view class="spot-info">
            <text class="spot-name">{{ spot.name }}</text>
            <text class="spot-distance">{{ formatDistance(spot.distance) }}</text>
          </view>
          <view class="spot-meta">
            <text class="fish-types">{{ spot.fish_types.join(', ') }}</text>
            <view class="spot-rating">
              <text v-for="i in 5" :key="i" :class="['star', i <= spot.rating ? 'filled' : '']">★</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="spot-detail-modal" v-if="selectedSpot">
      <view class="modal-content">
        <view class="modal-header">
          <text class="spot-title">{{ selectedSpot.name }}</text>
          <button class="close-btn" @click="selectedSpot = null">✕</button>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="spot-images" v-if="selectedSpot.images && selectedSpot.images.length">
            <image 
              v-for="(image, index) in selectedSpot.images" 
              :key="index"
              :src="image" 
              mode="aspectFill"
              class="spot-image"
            />
          </view>
          
          <view class="spot-details">
            <view class="detail-item">
              <text class="label">地址：</text>
              <text class="value">{{ selectedSpot.address || '暂无地址信息' }}</text>
            </view>
            
            <view class="detail-item">
              <text class="label">鱼种：</text>
              <text class="value">{{ selectedSpot.fish_types.join(', ') }}</text>
            </view>
            
            <view class="detail-item">
              <text class="label">难度：</text>
              <view class="difficulty-stars">
                <text v-for="i in 5" :key="i" :class="['star', i <= selectedSpot.difficulty ? 'filled' : '']">★</text>
              </view>
            </view>
            
            <view class="detail-item">
              <text class="label">收费：</text>
              <text class="value">{{ selectedSpot.is_free ? '免费' : '收费' }}</text>
            </view>
            
            <view class="detail-item" v-if="selectedSpot.description">
              <text class="label">描述：</text>
              <text class="value">{{ selectedSpot.description }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="action-btn primary" @click="navigateToSpot(selectedSpot)">
            <text>导航前往</text>
          </button>
          <button class="action-btn secondary" @click="favoriteSpot(selectedSpot.id)">
            <text>收藏</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocation } from '@/utils/location'
import { useSpotStore } from '@/store/spot'
import type { FishingSpot } from '@/types'

const location = useLocation()
const spotStore = useSpotStore()

// 地图相关状态
const centerLatitude = ref(39.9042) // 北京默认坐标
const centerLongitude = ref(116.4074)
const scale = ref(16)
const markers = ref<any[]>([])

// UI状态
const showSpotList = ref(false)
const showSearch = ref(false)
const selectedSpot = ref<FishingSpot | null>(null)
const nearbySpots = ref<any[]>([])

// 获取当前位置
const getCurrentLocation = async () => {
  try {
    const locationData = await location.getCurrentLocation()
    centerLatitude.value = locationData.latitude
    centerLongitude.value = locationData.longitude
    
    // 获取附近钓点
    await loadNearbySpots(locationData.latitude, locationData.longitude)
  } catch (error) {
    uni.showToast({
      title: '获取位置失败',
      icon: 'none'
    })
  }
}

// 加载附近钓点
const loadNearbySpots = async (lat: number, lng: number) => {
  const spots = await spotStore.fetchNearbySpots(lat, lng)
  
  // 计算距离并排序
  nearbySpots.value = spots.map(spot => ({
    ...spot,
    distance: location.calculateDistance(lat, lng, spot.latitude, spot.longitude)
  })).sort((a, b) => a.distance - b.distance)
  
  // 更新地图标记
  updateMapMarkers(nearbySpots.value)
  
  if (nearbySpots.value.length > 0) {
    showSpotList.value = true
  }
}

// 更新地图标记
const updateMapMarkers = (spots: any[]) => {
  markers.value = spots.map((spot, index) => ({
    id: index + 1,
    latitude: spot.latitude,
    longitude: spot.longitude,
    title: spot.name,
    iconPath: '/static/marker-fishing.png',
    width: 32,
    height: 32,
    callout: {
      content: spot.name,
      color: '#ffffff',
      bgColor: '#667eea',
      borderRadius: 4,
      padding: 8,
      display: 'BYCLICK'
    }
  }))
}

// 标记点击事件
const onMarkerTap = (e: any) => {
  const markerId = e.markerId
  const spot = nearbySpots.value[markerId - 1]
  if (spot) {
    selectedSpot.value = spot
  }
}

// 地图区域变化事件
const onRegionChange = (e: any) => {
  // 可以在这里实现地图移动时重新加载数据
}

// 选择钓点
const selectSpot = (spot: any) => {
  selectedSpot.value = spot
  showSpotList.value = false
}

// 导航到钓点
const navigateToSpot = (spot: FishingSpot) => {
  location.openLocation(spot.latitude, spot.longitude, spot.name, spot.address)
}

// 收藏钓点
const favoriteSpot = async (spotId: string) => {
  const result = await spotStore.favoriteSpot(spotId)
  if (result.success) {
    uni.showToast({
      title: '收藏成功',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: result.message || '收藏失败',
      icon: 'none'
    })
  }
}

// 格式化距离
const formatDistance = (distance: number): string => {
  return location.formatDistance(distance)
}

onMounted(() => {
  // 页面加载时获取当前位置
  getCurrentLocation()
})
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.map-controls {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  
  button {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.spot-list-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background: white;
  border-radius: 30rpx 30rpx 0 0;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    text {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
    
    .close-btn {
      width: 60rpx;
      height: 60rpx;
      border: none;
      background: none;
      font-size: 36rpx;
      color: #999;
    }
  }
  
  .spot-list {
    height: calc(100% - 120rpx);
    
    .spot-item {
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .spot-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        
        .spot-name {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }
        
        .spot-distance {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .spot-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .fish-types {
          font-size: 24rpx;
          color: #666;
          flex: 1;
          margin-right: 20rpx;
        }
        
        .spot-rating {
          .star {
            font-size: 20rpx;
            color: #ddd;
            
            &.filled {
              color: #ffa500;
            }
          }
        }
      }
    }
  }
}

.spot-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    width: 90vw;
    max-height: 80vh;
    background: white;
    border-radius: 20rpx;
    overflow: hidden;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .spot-title {
        font-size: 36rpx;
        font-weight: 500;
        color: #333;
      }
      
      .close-btn {
        width: 60rpx;
        height: 60rpx;
        border: none;
        background: none;
        font-size: 36rpx;
        color: #999;
      }
    }
    
    .modal-body {
      flex: 1;
      padding: 30rpx;
      
      .spot-images {
        display: flex;
        gap: 20rpx;
        margin-bottom: 30rpx;
        
        .spot-image {
          width: 200rpx;
          height: 150rpx;
          border-radius: 8rpx;
        }
      }
      
      .spot-details {
        .detail-item {
          display: flex;
          margin-bottom: 20rpx;
          
          .label {
            width: 120rpx;
            font-size: 28rpx;
            color: #666;
            flex-shrink: 0;
          }
          
          .value {
            font-size: 28rpx;
            color: #333;
            flex: 1;
          }
          
          .difficulty-stars {
            .star {
              font-size: 24rpx;
              color: #ddd;
              
              &.filled {
                color: #ffa500;
              }
            }
          }
        }
      }
    }
    
    .modal-footer {
      display: flex;
      gap: 20rpx;
      padding: 30rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .action-btn {
        flex: 1;
        padding: 24rpx;
        border-radius: 12rpx;
        font-size: 28rpx;
        font-weight: 500;
        border: none;
        
        &.primary {
          background: #667eea;
          color: white;
        }
        
        &.secondary {
          background: #f5f5f5;
          color: #333;
        }
      }
    }
  }
}
</style>
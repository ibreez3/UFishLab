<template>
  <view class="weather-container">
    <view class="location-header">
      <view class="location-info" @click="selectLocation">
        <text class="location-name">{{ currentLocation.name || '选择位置' }}</text>
        <text class="location-address">{{ currentLocation.address || '点击选择位置' }}</text>
      </view>
      <button class="refresh-btn" @click="refreshWeather">
        <text>🔄</text>
      </button>
    </view>
    
    <!-- 当前天气 -->
    <view class="current-weather" v-if="currentWeather">
      <view class="weather-main">
        <view class="temperature">
          <text class="temp-value">{{ currentWeather.temperature }}°</text>
          <text class="temp-unit">C</text>
        </view>
        <view class="weather-icon">
          <text class="weather-emoji">{{ getWeatherEmoji(currentWeather.condition) }}</text>
        </view>
      </view>
      
      <view class="weather-details">
        <view class="detail-item">
          <text class="detail-label">天气</text>
          <text class="detail-value">{{ currentWeather.condition }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">湿度</text>
          <text class="detail-value">{{ currentWeather.humidity }}%</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">风速</text>
          <text class="detail-value">{{ currentWeather.wind_speed }}km/h</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">气压</text>
          <text class="detail-value">{{ currentWeather.pressure }}hPa</text>
        </view>
      </view>
    </view>
    
    <!-- 钓鱼指数 -->
    <view class="fishing-index" v-if="fishingIndex">
      <view class="index-header">
        <text class="index-title">钓鱼指数</text>
        <view class="index-score" :class="getIndexClass(fishingIndex.overall_score)">
          <text>{{ fishingIndex.overall_score }}</text>
        </view>
      </view>
      
      <view class="index-details">
        <view class="index-item">
          <text class="index-label">综合评分</text>
          <view class="index-bar">
            <view 
              class="index-fill" 
              :style="{ width: (fishingIndex.overall_score / 10) * 100 + '%' }"
              :class="getIndexClass(fishingIndex.overall_score)"
            ></view>
          </view>
        </view>
        
        <view class="index-item">
          <text class="index-label">温度适宜度</text>
          <view class="index-bar">
            <view 
              class="index-fill" 
              :style="{ width: (fishingIndex.temperature_score / 10) * 100 + '%' }"
              :class="getIndexClass(fishingIndex.temperature_score)"
            ></view>
          </view>
        </view>
        
        <view class="index-item">
          <text class="index-label">气压适宜度</text>
          <view class="index-bar">
            <view 
              class="index-fill" 
              :style="{ width: (fishingIndex.pressure_score / 10) * 100 + '%' }"
              :class="getIndexClass(fishingIndex.pressure_score)"
            ></view>
          </view>
        </view>
        
        <view class="index-item">
          <text class="index-label">风力影响</text>
          <view class="index-bar">
            <view 
              class="index-fill" 
              :style="{ width: (fishingIndex.wind_score / 10) * 100 + '%' }"
              :class="getIndexClass(fishingIndex.wind_score)"
            ></view>
          </view>
        </view>
      </view>
      
      <view class="index-advice">
        <text class="advice-title">钓鱼建议</text>
        <text class="advice-content">{{ fishingIndex.advice }}</text>
      </view>
    </view>
    
    <!-- 目标鱼种分析 -->
    <view class="target-fish" v-if="targetFishAnalysis">
      <view class="target-header">
        <text class="target-title">目标鱼种分析</text>
      </view>
      
      <view class="fish-list">
        <view 
          v-for="fish in targetFishAnalysis" 
          :key="fish.fish_type"
          class="fish-item"
          @click="selectTargetFish(fish)"
        >
          <view class="fish-info">
            <text class="fish-name">{{ fish.fish_type }}</text>
            <view class="fish-activity" :class="getActivityClass(fish.activity_level)">
              <text>{{ getActivityLabel(fish.activity_level) }}</text>
            </view>
          </view>
          
          <view class="fish-details">
            <text class="fish-advice">{{ fish.advice }}</text>
            <view class="fish-score">
              <text>{{ fish.score }}/10</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 最佳时段 -->
    <view class="best-time" v-if="bestTimeSlots">
      <view class="time-header">
        <text class="time-title">最佳钓鱼时段</text>
      </view>
      
      <view class="time-slots">
        <view 
          v-for="slot in bestTimeSlots" 
          :key="slot.time"
          class="time-slot"
          :class="{ active: isCurrentTimeSlot(slot.time) }"
        >
          <text class="slot-time">{{ slot.time }}</text>
          <text class="slot-score">{{ slot.score }}/10</text>
          <view class="slot-bar">
            <view 
              class="slot-fill" 
              :style="{ width: (slot.score / 10) * 100 + '%' }"
            ></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 未来预报 -->
    <view class="forecast" v-if="forecast">
      <view class="forecast-header">
        <text class="forecast-title">未来72小时预报</text>
      </view>
      
      <scroll-view scroll-x class="forecast-list">
        <view 
          v-for="item in forecast" 
          :key="item.time"
          class="forecast-item"
        >
          <text class="forecast-time">{{ formatForecastTime(item.time) }}</text>
          <text class="forecast-emoji">{{ getWeatherEmoji(item.condition) }}</text>
          <text class="forecast-temp">{{ item.temperature }}°</text>
          <text class="forecast-index">{{ item.fishing_index }}/10</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocation } from '@/utils/location'

const location = useLocation()

// 位置信息
const currentLocation = ref({
  name: '',
  address: '',
  latitude: 39.9042,
  longitude: 116.4074
})

// 天气数据
const currentWeather = ref({
  temperature: 22,
  condition: '晴',
  humidity: 65,
  wind_speed: 12,
  wind_direction: '东北风',
  pressure: 1013
})

const fishingIndex = ref({
  overall_score: 7.5,
  temperature_score: 8.0,
  pressure_score: 7.0,
  wind_score: 6.5,
  advice: '今天天气条件较好，适合出钓。建议选择背风向阳的钓点，使用腥香型饵料效果更佳。'
})

const targetFishAnalysis = ref([
  {
    fish_type: '鲫鱼',
    activity_level: 'high',
    score: 8.5,
    advice: '活性较高，建议钓深1.5-2米，使用腥香饵料'
  },
  {
    fish_type: '鲤鱼',
    activity_level: 'medium',
    score: 6.5,
    advice: '活性一般，建议钓深2-3米，耐心等待'
  },
  {
    fish_type: '草鱼',
    activity_level: 'low',
    score: 4.5,
    advice: '活性较低，建议选择水草丰富区域'
  }
])

const bestTimeSlots = ref([
  { time: '06:00-08:00', score: 8.5 },
  { time: '10:00-12:00', score: 7.0 },
  { time: '14:00-16:00', score: 6.5 },
  { time: '18:00-20:00', score: 8.0 }
])

const forecast = ref([
  { time: '明天上午', condition: '多云', temperature: 20, fishing_index: 7.5 },
  { time: '明天下午', condition: '晴', temperature: 24, fishing_index: 8.0 },
  { time: '明天晚上', condition: '晴', temperature: 18, fishing_index: 7.0 },
  { time: '后天上午', condition: '小雨', temperature: 16, fishing_index: 6.0 },
  { time: '后天下午', condition: '阴', temperature: 19, fishing_index: 6.5 },
  { time: '后天晚上', condition: '多云', temperature: 15, fishing_index: 5.5 }
])

// 选择位置
const selectLocation = async () => {
  try {
    const locationData = await location.chooseLocation()
    currentLocation.value = {
      name: locationData.name,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }
    
    // 重新获取天气数据
    await refreshWeather()
  } catch (error) {
    console.error('选择位置失败:', error)
  }
}

// 刷新天气
const refreshWeather = async () => {
  uni.showLoading({
    title: '获取天气数据中...'
  })
  
  try {
    // 这里调用天气API
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.showToast({
      title: '天气数据已更新',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '获取天气数据失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 获取天气表情符号
const getWeatherEmoji = (condition: string): string => {
  const emojiMap: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌦️',
    '中雨': '🌧️',
    '大雨': '⛈️',
    '雪': '❄️',
    '雾': '🌫️'
  }
  return emojiMap[condition] || '🌤️'
}

// 获取指数等级样式
const getIndexClass = (score: number): string => {
  if (score >= 8) return 'excellent'
  if (score >= 6) return 'good'
  if (score >= 4) return 'fair'
  return 'poor'
}

// 获取活性等级样式
const getActivityClass = (level: string): string => {
  return level
}

// 获取活性标签
const getActivityLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'high': '高活性',
    'medium': '中活性',
    'low': '低活性'
  }
  return labels[level] || '未知'
}

// 选择目标鱼种
const selectTargetFish = (fish: any) => {
  uni.showModal({
    title: fish.fish_type,
    content: fish.advice,
    showCancel: false
  })
}

// 判断是否为当前时段
const isCurrentTimeSlot = (timeSlot: string): boolean => {
  const now = new Date()
  const currentHour = now.getHours()
  
  const [start, end] = timeSlot.split('-')
  const startHour = parseInt(start.split(':')[0])
  const endHour = parseInt(end.split(':')[0])
  
  return currentHour >= startHour && currentHour < endHour
}

// 格式化预报时间
const formatForecastTime = (time: string): string => {
  return time
}

onMounted(() => {
  // 获取当前位置
  location.getCurrentLocation().then(locationData => {
    currentLocation.value = {
      name: '当前位置',
      address: '获取中...',
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }
  }).catch(error => {
    console.error('获取位置失败:', error)
  })
})
</script>

<style lang="scss" scoped>
.weather-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .location-info {
    flex: 1;
    
    .location-name {
      display: block;
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .location-address {
      display: block;
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .refresh-btn {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #667eea;
    color: white;
    border: none;
    font-size: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      opacity: 0.8;
    }
  }
}

.current-weather {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .weather-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    
    .temperature {
      display: flex;
      align-items: flex-start;
      
      .temp-value {
        font-size: 80rpx;
        font-weight: 300;
        color: #333;
      }
      
      .temp-unit {
        font-size: 40rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }
    
    .weather-icon {
      .weather-emoji {
        font-size: 80rpx;
      }
    }
  }
  
  .weather-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .detail-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .detail-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.fishing-index {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .index-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .index-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
    
    .index-score {
      padding: 12rpx 24rpx;
      border-radius: 24rpx;
      font-size: 32rpx;
      font-weight: bold;
      
      &.excellent {
        background: #e8f5e8;
        color: #4caf50;
      }
      
      &.good {
        background: #e3f2fd;
        color: #2196f3;
      }
      
      &.fair {
        background: #fff3e0;
        color: #ff9800;
      }
      
      &.poor {
        background: #ffebee;
        color: #f44336;
      }
    }
  }
  
  .index-details {
    margin-bottom: 30rpx;
    
    .index-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .index-label {
        width: 120rpx;
        font-size: 28rpx;
        color: #666;
      }
      
      .index-bar {
        flex: 1;
        height: 16rpx;
        background: #f0f0f0;
        border-radius: 8rpx;
        margin: 0 20rpx;
        overflow: hidden;
        
        .index-fill {
          height: 100%;
          border-radius: 8rpx;
          transition: width 0.3s ease;
          
          &.excellent {
            background: #4caf50;
          }
          
          &.good {
            background: #2196f3;
          }
          
          &.fair {
            background: #ff9800;
          }
          
          &.poor {
            background: #f44336;
          }
        }
      }
    }
  }
  
  .index-advice {
    background: #f9f9f9;
    padding: 30rpx;
    border-radius: 12rpx;
    
    .advice-title {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .advice-content {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.target-fish {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .target-header {
    margin-bottom: 30rpx;
    
    .target-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .fish-list {
    .fish-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background: #f9f9f9;
      }
      
      .fish-info {
        flex: 1;
        
        .fish-name {
          display: block;
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .fish-activity {
          display: inline-block;
          padding: 6rpx 16rpx;
          border-radius: 16rpx;
          font-size: 24rpx;
          
          &.high {
            background: #e8f5e8;
            color: #4caf50;
          }
          
          &.medium {
            background: #fff3e0;
            color: #ff9800;
          }
          
          &.low {
            background: #ffebee;
            color: #f44336;
          }
        }
      }
      
      .fish-details {
        text-align: right;
        
        .fish-advice {
          display: block;
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
          max-width: 300rpx;
        }
        
        .fish-score {
          font-size: 28rpx;
          font-weight: 500;
          color: #667eea;
        }
      }
    }
  }
}

.best-time {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .time-header {
    margin-bottom: 30rpx;
    
    .time-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .time-slots {
    .time-slot {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.active {
        background: #f0f8ff;
        margin: 0 -40rpx;
        padding: 20rpx 40rpx;
        border-radius: 12rpx;
      }
      
      .slot-time {
        width: 150rpx;
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
      
      .slot-score {
        width: 80rpx;
        font-size: 28rpx;
        color: #667eea;
        font-weight: 500;
        text-align: right;
      }
      
      .slot-bar {
        flex: 1;
        height: 12rpx;
        background: #f0f0f0;
        border-radius: 6rpx;
        margin: 0 20rpx;
        overflow: hidden;
        
        .slot-fill {
          height: 100%;
          background: #667eea;
          border-radius: 6rpx;
          transition: width 0.3s ease;
        }
      }
    }
  }
}

.forecast {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  
  .forecast-header {
    margin-bottom: 30rpx;
    
    .forecast-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .forecast-list {
    white-space: nowrap;
    
    .forecast-item {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;
      margin-right: 20rpx;
      background: #f9f9f9;
      border-radius: 12rpx;
      min-width: 120rpx;
      
      .forecast-time {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
      
      .forecast-emoji {
        font-size: 40rpx;
        margin-bottom: 8rpx;
      }
      
      .forecast-temp {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 8rpx;
      }
      
      .forecast-index {
        font-size: 24rpx;
        color: #667eea;
        font-weight: 500;
      }
    }
  }
}
</style>
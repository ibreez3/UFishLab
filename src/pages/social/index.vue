<template>
  <view class="social-container">
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>
    
    <view class="content-area">
      <!-- 动态列表 -->
      <scroll-view 
        v-if="activeTab === 'posts'"
        scroll-y 
        class="posts-list"
        @scrolltolower="loadMorePosts"
        refresher-enabled
        @refresherrefresh="refreshPosts"
        :refresher-triggered="refreshing"
      >
        <view v-if="posts.length === 0" class="empty-state">
          <text>暂无动态，快来发布第一条动态吧！</text>
        </view>
        
        <view v-else class="posts-container">
          <view 
            v-for="post in posts" 
            :key="post.id"
            class="post-item"
            @click="viewPostDetail(post)"
          >
            <view class="post-header">
              <image 
                :src="post.user?.avatar || '/static/default-avatar.png'" 
                class="user-avatar"
                mode="aspectFill"
              />
              <view class="user-info">
                <text class="username">{{ post.user?.username || '匿名用户' }}</text>
                <text class="post-time">{{ formatTime(post.created_at) }}</text>
              </view>
              <view class="post-type" :class="post.post_type">
                <text>{{ getPostTypeLabel(post.post_type) }}</text>
              </view>
            </view>
            
            <view class="post-content">
              <text class="content-text">{{ post.content }}</text>
              
              <view v-if="post.images && post.images.length" class="post-images">
                <image 
                  v-for="(image, index) in post.images.slice(0, 3)" 
                  :key="index"
                  :src="image" 
                  class="post-image"
                  mode="aspectFill"
                  @click.stop="previewImage(post.images, index)"
                />
              </view>
              
              <view v-if="post.location" class="post-location">
                <text>📍 {{ post.location }}</text>
              </view>
              
              <view v-if="post.tags && post.tags.length" class="post-tags">
                <text v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</text>
              </view>
            </view>
            
            <view class="post-actions">
              <button 
                class="action-btn"
                :class="{ active: post.is_liked }"
                @click.stop="toggleLike(post)"
              >
                <text class="action-icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
                <text class="action-count">{{ post.likes_count }}</text>
              </button>
              
              <button class="action-btn" @click.stop="viewPostDetail(post)">
                <text class="action-icon">💬</text>
                <text class="action-count">{{ post.comments_count }}</text>
              </button>
              
              <button class="action-btn" @click.stop="sharePost(post)">
                <text class="action-icon">📤</text>
              </button>
            </view>
          </view>
          
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 问答专区 -->
      <scroll-view 
        v-if="activeTab === 'qa'"
        scroll-y 
        class="qa-list"
        @scrolltolower="loadMoreQuestions"
        refresher-enabled
        @refresherrefresh="refreshQuestions"
        :refresher-triggered="refreshing"
      >
        <view class="qa-header">
          <button class="ask-btn" @click="askQuestion">
            <text>📝 提问</text>
          </button>
        </view>
        
        <view v-if="questions.length === 0" class="empty-state">
          <text>暂无问题，快来提出第一个问题吧！</text>
        </view>
        
        <view v-else class="questions-container">
          <view 
            v-for="question in questions" 
            :key="question.id"
            class="question-item"
            @click="viewQuestionDetail(question)"
          >
            <view class="question-header">
              <text class="question-title">{{ question.title }}</text>
              <view class="question-reward" v-if="question.reward_points">
                <text>💰 {{ question.reward_points }}</text>
              </view>
            </view>
            
            <view class="question-content">
              <text class="question-desc">{{ question.content }}</text>
            </view>
            
            <view class="question-meta">
              <view class="meta-item">
                <image 
                  :src="question.user?.avatar || '/static/default-avatar.png'" 
                  class="user-avatar-small"
                  mode="aspectFill"
                />
                <text class="username">{{ question.user?.username || '匿名用户' }}</text>
              </view>
              
              <view class="meta-stats">
                <text class="stat">👁️ {{ question.view_count || 0 }}</text>
                <text class="stat">💬 {{ question.answer_count || 0 }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 约钓活动 -->
      <scroll-view 
        v-if="activeTab === 'activities'"
        scroll-y 
        class="activities-list"
        @scrolltolower="loadMoreActivities"
        refresher-enabled
        @refresherrefresh="refreshActivities"
        :refresher-triggered="refreshing"
      >
        <view class="activities-header">
          <button class="create-activity-btn" @click="createActivity">
            <text>🎯 发起约钓</text>
          </button>
        </view>
        
        <view v-if="activities.length === 0" class="empty-state">
          <text>暂无约钓活动，快来发起第一个活动吧！</text>
        </view>
        
        <view v-else class="activities-container">
          <view 
            v-for="activity in activities" 
            :key="activity.id"
            class="activity-item"
            @click="viewActivityDetail(activity)"
          >
            <view class="activity-header">
              <text class="activity-title">{{ activity.title }}</text>
              <view class="activity-status" :class="activity.status">
                <text>{{ getActivityStatusLabel(activity.status) }}</text>
              </view>
            </view>
            
            <view class="activity-info">
              <view class="info-item">
                <text class="info-icon">📍</text>
                <text class="info-text">{{ activity.location }}</text>
              </view>
              
              <view class="info-item">
                <text class="info-icon">📅</text>
                <text class="info-text">{{ formatDate(activity.start_time) }}</text>
              </view>
              
              <view class="info-item">
                <text class="info-icon">👥</text>
                <text class="info-text">{{ activity.current_participants }}/{{ activity.max_participants }}人</text>
              </view>
            </view>
            
            <view class="activity-footer">
              <view class="organizer">
                <image 
                  :src="activity.organizer?.avatar || '/static/default-avatar.png'" 
                  class="user-avatar-small"
                  mode="aspectFill"
                />
                <text class="username">{{ activity.organizer?.username || '匿名用户' }}</text>
              </view>
              
              <view class="activity-actions">
                <button 
                  class="join-btn" 
                  :class="{ joined: activity.is_joined }"
                  @click.stop="toggleJoinActivity(activity)"
                >
                  <text>{{ activity.is_joined ? '已参加' : '参加' }}</text>
                </button>
              </view>
            </view>
          </view>
          
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 发布按钮 -->
    <view class="fab-container">
      <button class="fab-btn" @click="createPost">
        <text class="fab-icon">+</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import type { CommunityPost } from '@/types'

const authStore = useAuthStore()

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'qa', label: '问答' },
  { key: 'activities', label: '约钓' }
]

const activeTab = ref('posts')
const posts = ref<CommunityPost[]>([])
const questions = ref<any[]>([])
const activities = ref<any[]>([])
const loading = ref(false)
const refreshing = ref(false)

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab
  
  // 根据标签页加载对应数据
  switch (tab) {
    case 'posts':
      loadPosts()
      break
    case 'qa':
      loadQuestions()
      break
    case 'activities':
      loadActivities()
      break
  }
}

// 加载动态
const loadPosts = async () => {
  loading.value = true
  try {
    // 这里调用API获取动态数据
    // 暂时使用模拟数据
    posts.value = [
      {
        id: '1',
        user_id: '1',
        user: {
          id: '1',
          username: '钓鱼达人',
          avatar: '/static/avatar1.png'
        },
        content: '今天在水库钓到了一条大草鱼，手感真不错！分享一下我的钓行报告...',
        images: ['/static/fish1.jpg', '/static/fish2.jpg'],
        post_type: 'catch',
        likes_count: 25,
        comments_count: 8,
        is_liked: false,
        tags: ['草鱼', '水库', '爆护'],
        location: '密云水库',
        created_at: '2024-01-15T10:30:00Z'
      }
    ]
  } catch (error) {
    console.error('加载动态失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载问题
const loadQuestions = async () => {
  loading.value = true
  try {
    // 这里调用API获取问题数据
    questions.value = []
  } catch (error) {
    console.error('加载问题失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载活动
const loadActivities = async () => {
  loading.value = true
  try {
    // 这里调用API获取活动数据
    activities.value = []
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshPosts = async () => {
  refreshing.value = true
  await loadPosts()
  refreshing.value = false
}

const refreshQuestions = async () => {
  refreshing.value = true
  await loadQuestions()
  refreshing.value = false
}

const refreshActivities = async () => {
  refreshing.value = true
  await loadActivities()
  refreshing.value = false
}

// 加载更多
const loadMorePosts = () => {
  // 实现分页加载逻辑
}

const loadMoreQuestions = () => {
  // 实现分页加载逻辑
}

const loadMoreActivities = () => {
  // 实现分页加载逻辑
}

// 动态相关操作
const viewPostDetail = (post: CommunityPost) => {
  uni.navigateTo({
    url: `/pages/social/post-detail?id=${post.id}`
  })
}

const toggleLike = async (post: CommunityPost) => {
  if (!authStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  // 这里调用API实现点赞/取消点赞
  post.is_liked = !post.is_liked
  post.likes_count += post.is_liked ? 1 : -1
}

const sharePost = (post: CommunityPost) => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

const previewImage = (images: string[], currentIndex: number) => {
  uni.previewImage({
    urls: images,
    current: currentIndex
  })
}

// 发布动态
const createPost = () => {
  if (!authStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/social/create-post'
  })
}

// 问答相关操作
const askQuestion = () => {
  if (!authStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/social/ask-question'
  })
}

const viewQuestionDetail = (question: any) => {
  uni.navigateTo({
    url: `/pages/social/question-detail?id=${question.id}`
  })
}

// 活动相关操作
const createActivity = () => {
  if (!authStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/social/create-activity'
  })
}

const viewActivityDetail = (activity: any) => {
  uni.navigateTo({
    url: `/pages/social/activity-detail?id=${activity.id}`
  })
}

const toggleJoinActivity = (activity: any) => {
  if (!authStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  // 这里调用API实现参加/取消参加活动
  activity.is_joined = !activity.is_joined
  activity.current_participants += activity.is_joined ? 1 : -1
}

// 工具函数
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

const getPostTypeLabel = (type: string): string => {
  const labels = {
    'catch': '渔获',
    'spot': '钓点',
    'question': '提问',
    'tips': '技巧'
  }
  return labels[type as keyof typeof labels] || '动态'
}

const getActivityStatusLabel = (status: string): string => {
  const labels = {
    'pending': '报名中',
    'confirmed': '已确认',
    'ongoing': '进行中',
    'completed': '已结束',
    'cancelled': '已取消'
  }
  return labels[status as keyof typeof labels] || '未知'
}

onMounted(() => {
  loadPosts()
})
</script>

<style lang="scss" scoped>
.social-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.tab-bar {
  display: flex;
  background: white;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    padding: 30rpx;
    text-align: center;
    position: relative;
    
    text {
      font-size: 30rpx;
      color: #666;
    }
    
    &.active {
      text {
        color: #667eea;
        font-weight: 500;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #667eea;
        border-radius: 2rpx;
      }
    }
  }
}

.content-area {
  height: calc(100vh - 100rpx);
}

.posts-list,
.qa-list,
.activities-list {
  height: 100%;
}

.qa-header,
.activities-header {
  padding: 30rpx;
  background: white;
  border-bottom: 1rpx solid #f0f0f0;
  
  .ask-btn,
  .create-activity-btn {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12rpx;
    padding: 24rpx 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    
    &:active {
      opacity: 0.8;
    }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999;
  font-size: 28rpx;
}

.post-item {
  background: white;
  margin-bottom: 20rpx;
  padding: 30rpx;
  
  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }
    
    .user-info {
      flex: 1;
      
      .username {
        display: block;
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 4rpx;
      }
      
      .post-time {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .post-type {
      padding: 8rpx 16rpx;
      border-radius: 16rpx;
      font-size: 22rpx;
      
      &.catch {
        background: #e8f5e8;
        color: #4caf50;
      }
      
      &.spot {
        background: #e3f2fd;
        color: #2196f3;
      }
      
      &.question {
        background: #fff3e0;
        color: #ff9800;
      }
      
      &.tips {
        background: #f3e5f5;
        color: #9c27b0;
      }
    }
  }
  
  .post-content {
    margin-bottom: 20rpx;
    
    .content-text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .post-images {
      display: flex;
      gap: 16rpx;
      margin: 16rpx 0;
      
      .post-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 8rpx;
      }
    }
    
    .post-location {
      font-size: 26rpx;
      color: #666;
      margin: 16rpx 0;
    }
    
    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      
      .tag {
        background: #f5f5f5;
        color: #666;
        font-size: 24rpx;
        padding: 8rpx 16rpx;
        border-radius: 16rpx;
      }
    }
  }
  
  .post-actions {
    display: flex;
    justify-content: space-around;
    border-top: 1rpx solid #f5f5f5;
    padding-top: 20rpx;
    
    .action-btn {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx;
      border-radius: 8rpx;
      
      &.active {
        background: #fff5f5;
      }
      
      .action-icon {
        font-size: 32rpx;
      }
      
      .action-count {
        font-size: 26rpx;
        color: #666;
      }
      
      &:active {
        background: #f5f5f5;
      }
    }
  }
}

.question-item,
.activity-item {
  background: white;
  margin-bottom: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  
  .question-header,
  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
    
    .question-title,
    .activity-title {
      flex: 1;
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      margin-right: 20rpx;
    }
    
    .question-reward,
    .activity-status {
      padding: 8rpx 16rpx;
      border-radius: 16rpx;
      font-size: 22rpx;
      
      &.pending {
        background: #e3f2fd;
        color: #2196f3;
      }
      
      &.confirmed {
        background: #e8f5e8;
        color: #4caf50;
      }
      
      &.ongoing {
        background: #fff3e0;
        color: #ff9800;
      }
      
      &.completed {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
  
  .question-content,
  .activity-info {
    margin-bottom: 20rpx;
    
    .question-desc,
    .info-item {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 8rpx;
      
      .info-icon {
        margin-right: 8rpx;
      }
    }
  }
  
  .question-meta,
  .activity-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .meta-item,
    .organizer {
      display: flex;
      align-items: center;
      
      .user-avatar-small {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 8rpx;
      }
      
      .username {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .meta-stats,
    .activity-actions {
      display: flex;
      gap: 20rpx;
      
      .stat {
        font-size: 24rpx;
        color: #999;
      }
      
      .join-btn {
        padding: 12rpx 24rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        border: 2rpx solid #667eea;
        background: white;
        color: #667eea;
        
        &.joined {
          background: #667eea;
          color: white;
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

.loading-more {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

.fab-container {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  z-index: 1000;
  
  .fab-btn {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #667eea;
    color: white;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .fab-icon {
      font-size: 48rpx;
      font-weight: 300;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
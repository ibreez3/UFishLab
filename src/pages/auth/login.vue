<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">欢迎回来</text>
      <text class="subtitle">研究每一次出钓，连接每一位钓友</text>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="请输入用户名"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码"
          class="input"
        />
      </view>
      
      <button class="login-btn" @click="handleLogin" :loading="loading">
        <text>{{ loading ? '登录中...' : '登录' }}</text>
      </button>
      
      <view class="form-footer">
        <text class="link" @click="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (!form.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  
  try {
    const result = await authStore.login(form.username, form.password)
    
    if (result.success) {
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: result.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
  
  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }
  
  .input {
    width: 100%;
    height: 80rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    background: #fff;
    transition: border-color 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      outline: none;
    }
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

.form-footer {
  text-align: center;
  margin-top: 40rpx;
  
  .link {
    font-size: 26rpx;
    color: #667eea;
    text-decoration: none;
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style>
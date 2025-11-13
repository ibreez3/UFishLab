<template>
  <view class="register-container">
    <view class="register-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">创建账号</text>
      <text class="subtitle">加入钓研社，开启你的钓鱼研究之旅</text>
    </view>
    
    <view class="register-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="请输入用户名（3-20位）"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">邮箱</text>
        <input 
          v-model="form.email" 
          type="email" 
          placeholder="请输入邮箱地址"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码（6-20位）"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请再次输入密码"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">手机号（可选）</text>
        <input 
          v-model="form.phone" 
          type="tel" 
          placeholder="请输入手机号"
          class="input"
        />
      </view>
      
      <button class="register-btn" @click="handleRegister" :loading="loading">
        <text>{{ loading ? '注册中...' : '注册' }}</text>
      </button>
      
      <view class="form-footer">
        <text class="link" @click="goToLogin">已有账号？立即登录</text>
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
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

const loading = ref(false)

const validateForm = () => {
  if (!form.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return false
  }
  
  if (form.username.length < 3 || form.username.length > 20) {
    uni.showToast({
      title: '用户名长度应为3-20位',
      icon: 'none'
    })
    return false
  }
  
  if (!form.email.trim()) {
    uni.showToast({
      title: '请输入邮箱地址',
      icon: 'none'
    })
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    uni.showToast({
      title: '请输入有效的邮箱地址',
      icon: 'none'
    })
    return false
  }
  
  if (!form.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return false
  }
  
  if (form.password.length < 6 || form.password.length > 20) {
    uni.showToast({
      title: '密码长度应为6-20位',
      icon: 'none'
    })
    return false
  }
  
  if (form.password !== form.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    })
    return false
  }
  
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    uni.showToast({
      title: '请输入有效的手机号',
      icon: 'none'
    })
    return false
  }
  
  return true
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const registerData = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined
    }
    
    const result = await authStore.register(registerData)
    
    if (result.success) {
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      // 注册成功后跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: result.message || '注册失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '注册失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.register-header {
  text-align: center;
  margin-bottom: 60rpx;
  
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

.register-form {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 30rpx;
  
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

.register-btn {
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
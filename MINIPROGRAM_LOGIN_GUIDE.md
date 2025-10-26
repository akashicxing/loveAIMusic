# 微信小程序登录实现指南

## 🎯 **方案概述**

由于网站应用登录权限未开通，我们使用微信小程序登录作为替代方案。

## 📋 **实现步骤**

### **1. 创建微信小程序**

1. **登录微信开放平台**
   - 访问：https://open.weixin.qq.com/
   - 选择"小程序"类型

2. **创建小程序**
   - 应用名称：为爱而歌-登录助手
   - 功能：用户登录认证
   - 获取小程序AppID

### **2. 小程序代码结构**

```
miniprogram/
├── app.js
├── app.json
├── pages/
│   └── login/
│       ├── login.js
│       ├── login.wxml
│       └── login.wxss
```

### **3. 小程序登录页面代码**

#### **app.json**
```json
{
  "pages": [
    "pages/login/login"
  ],
  "window": {
    "navigationBarTitleText": "为爱而歌登录"
  }
}
```

#### **pages/login/login.wxml**
```xml
<view class="container">
  <view class="header">
    <image class="logo" src="/images/logo.png" />
    <text class="title">为爱而歌</text>
    <text class="subtitle">AI Love Song Creator</text>
  </view>
  
  <view class="login-section">
    <button class="login-btn" bindtap="handleLogin">
      <text>微信授权登录</text>
    </button>
  </view>
</view>
```

#### **pages/login/login.js**
```javascript
Page({
  data: {
    userInfo: null
  },

  onLoad(options) {
    // 获取重定向URL
    this.redirectUrl = decodeURIComponent(options.redirect || '');
  },

  // 微信授权登录
  handleLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        
        // 获取登录凭证
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 发送登录信息到网站
              this.sendLoginInfo(userInfo, loginRes.code);
            }
          }
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '授权失败',
          icon: 'error'
        });
      }
    });
  },

  // 发送登录信息到网站
  sendLoginInfo(userInfo, code) {
    // 通过postMessage发送登录信息
    const loginData = {
      type: 'WECHAT_LOGIN_SUCCESS',
      user: {
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        code: code
      }
    };

    // 发送消息到网站
    wx.miniProgram.postMessage({
      data: loginData
    });

    // 关闭小程序
    wx.miniProgram.navigateBack();
  }
});
```

#### **pages/login/login.wxss**
```css
.container {
  padding: 40rpx;
  text-align: center;
}

.header {
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.login-section {
  margin-top: 100rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(45deg, #07c160, #00d4aa);
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}
```

## 🔧 **网站端集成**

### **1. 修改登录页面**

网站登录页面已经集成了小程序登录组件，用户可以选择：
- 微信网站登录（如果权限开通）
- 微信小程序登录（当前可用）

### **2. 处理登录回调**

```javascript
// 监听小程序返回的登录信息
window.addEventListener('message', (event) => {
  if (event.data.type === 'WECHAT_LOGIN_SUCCESS') {
    const userInfo = event.data.user;
    // 处理登录逻辑
    handleLoginSuccess(userInfo);
  }
});
```

## 🎯 **优势**

1. **无需网站登录权限** - 使用小程序权限
2. **用户体验好** - 扫码即登录
3. **审核通过率高** - 小程序权限更容易获得
4. **功能完整** - 可以获取用户基本信息

## 📱 **使用流程**

1. 用户在网站点击"微信小程序登录"
2. 拉起微信小程序
3. 用户在小程序内授权登录
4. 小程序返回登录信息到网站
5. 网站完成登录流程

## ⚠️ **注意事项**

1. 需要在微信环境中使用
2. 小程序需要发布后才能使用
3. 需要配置小程序的业务域名
4. 建议同时保留网站登录作为备选方案

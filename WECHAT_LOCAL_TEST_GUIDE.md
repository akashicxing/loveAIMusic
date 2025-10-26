# 微信登录本地测试指南

## 🎯 问题解决

根据您的截图显示"微信登录未配置"，这是因为微信开放平台应用绑定的是生产域名，但需要在本地测试。

## 📋 解决方案

### 方案一：配置本地测试（推荐）

#### 1. 微信开放平台配置

1. **登录微信开放平台**
   - 访问：https://open.weixin.qq.com/
   - 使用微信扫码登录

2. **绑定管理员**（参考[官方文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/guide/bind_admin.html)）
   - 前往微信开发者平台
   - 点击「前往体验」，使用微信扫码登录
   - 进入控制台首页后，前往「我的业务 - 网站应用」
   - 输入网站应用的 AppID
   - 完成管理员绑定和身份验证

3. **配置授权回调域名**
   - 在网站应用详情页
   - 添加本地测试域名：`localhost:3000`
   - 保存配置

#### 2. 本地环境配置

1. **复制配置模板**
   ```bash
   cp wechat-local-test.env .env.local
   ```

2. **更新配置信息**
   - 将 `your_wechat_app_id_here` 替换为您的真实 AppID
   - 将 `your_wechat_app_secret_here` 替换为您的真实 AppSecret
   - 将 `your_jwt_secret_key_here_make_it_long_and_random` 替换为随机字符串

3. **启动本地服务器**
   ```bash
   npm run dev
   ```

4. **测试微信登录**
   - 访问：http://localhost:3000/login
   - 点击微信登录按钮
   - 使用微信扫码授权

### 方案二：使用生产域名测试

#### 1. 配置生产环境

1. **更新环境变量**
   ```bash
   # 将 WECHAT_REDIRECT_URI 改为生产域名
   WECHAT_REDIRECT_URI=https://aimusic.sale/auth/wechat/callback
   ```

2. **部署到生产服务器**
   ```bash
   npm run build
   # 部署到您的生产服务器
   ```

3. **测试生产环境**
   - 访问：https://aimusic.sale/login
   - 测试微信登录功能

## 🔧 详细配置步骤

### 1. 微信开放平台设置

#### 创建网站应用（如果还没有）
1. 登录微信开放平台
2. 进入「管理中心」
3. 选择「网站应用」
4. 点击「创建网站应用」
5. 填写应用信息：
   - 应用名称：为爱而歌
   - 应用简介：AI音乐创作平台
   - 应用官网：https://aimusic.sale
   - 应用图标：上传您的应用图标

#### 配置授权回调域名
1. 在应用详情页找到「授权回调域名」
2. 添加以下域名：
   - `localhost:3000`（本地测试）
   - `aimusic.sale`（生产环境）
   - `www.aimusic.sale`（生产环境）

#### 获取AppID和AppSecret
1. 在应用详情页找到「开发信息」
2. 复制 AppID 和 AppSecret
3. 更新到 `.env.local` 文件中

### 2. 本地测试配置

#### 更新环境变量
```bash
# 编辑 .env.local 文件
nano .env.local

# 或者直接复制模板
cp wechat-local-test.env .env.local
```

#### 关键配置项
```env
# 微信开放平台配置
WECHAT_APP_ID=wx1234567890abcdef  # 您的真实AppID
WECHAT_APP_SECRET=your_real_app_secret_here  # 您的真实AppSecret
WECHAT_REDIRECT_URI=http://localhost:3000/auth/wechat/callback

# JWT配置（生成随机字符串）
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
```

### 3. 测试步骤

#### 启动应用
```bash
# 安装依赖（如果需要）
npm install

# 启动开发服务器
npm run dev
```

#### 测试登录
1. 打开浏览器访问：http://localhost:3000/login
2. 点击「微信登录」按钮
3. 使用微信扫码授权
4. 检查是否成功跳转并登录

#### 调试工具
```bash
# 检查微信配置
npm run wechat:check

# 测试微信API
npm run wechat:test
```

## 🚨 常见问题解决

### 问题1：显示"微信登录未配置"
**原因**：环境变量未正确配置
**解决**：
1. 检查 `.env.local` 文件是否存在
2. 确认 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET` 已配置
3. 重启开发服务器

### 问题2：授权回调域名不匹配
**原因**：微信开放平台未配置本地域名
**解决**：
1. 在微信开放平台添加 `localhost:3000` 到授权回调域名
2. 等待配置生效（通常需要几分钟）

### 问题3：扫码后无法跳转
**原因**：回调URL配置错误
**解决**：
1. 检查 `WECHAT_REDIRECT_URI` 配置
2. 确保与微信开放平台配置一致
3. 检查回调页面是否存在

## 📱 测试验证

### 功能测试清单
- [ ] 登录页面正常显示
- [ ] 微信登录按钮可点击
- [ ] 微信扫码授权成功
- [ ] 授权后正确跳转
- [ ] 用户信息正确获取
- [ ] 登录状态正确保存

### 调试信息
查看浏览器控制台和服务器日志：
```bash
# 查看服务器日志
npm run dev

# 查看详细调试信息
DEBUG=* npm run dev
```

## 🎉 完成测试

配置完成后，您应该能够：
1. 在本地环境测试微信登录
2. 使用微信扫码完成授权
3. 成功获取用户信息
4. 正常使用应用功能

如果遇到问题，请检查：
1. 微信开放平台配置是否正确
2. 环境变量是否完整
3. 网络连接是否正常
4. 浏览器控制台是否有错误信息

## 📚 相关文档

- [微信开放平台绑定管理员](https://developers.weixin.qq.com/doc/oplatform/Website_App/guide/bind_admin.html)
- [网站应用微信登录开发指南](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/WeChat_Login.html)
- [PC OpenSDK接入指南](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_PC_APIs/guideline.html)

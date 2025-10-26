# 微信登录手工测试指南

## 🎯 测试准备

### 1. 环境配置检查

首先检查当前配置状态：

```bash
# 检查微信登录配置
npm run wechat:check

# 检查安全认证状态
npm run wechat:security
```

### 2. 启动开发服务器

```bash
# 启动Next.js开发服务器
npm run dev
```

服务器启动后，访问：http://localhost:3000

## 🧪 测试步骤

### 测试1：基础功能测试

#### 1.1 访问登录页面
- 打开浏览器访问：http://localhost:3000/login
- 检查页面是否正常加载
- 检查微信登录按钮是否显示

#### 1.2 检查微信登录按钮状态
- 如果显示"微信登录未配置"：需要配置环境变量
- 如果显示"微信登录"：说明配置正确

#### 1.3 测试页面导航
- 点击导航栏的"登录"按钮
- 检查是否跳转到登录页面
- 测试移动端菜单中的登录按钮

### 测试2：微信登录功能测试

#### 2.1 配置微信登录（如果未配置）

1. **创建微信开放平台应用**：
   - 访问：https://open.weixin.qq.com/
   - 登录微信开放平台
   - 创建网站应用
   - 获取AppID和AppSecret

2. **配置环境变量**：
   ```bash
   # 编辑环境变量文件
   nano .env.local
   ```
   
   添加以下配置：
   ```env
   # 微信登录配置
   WECHAT_APP_ID=你的微信AppID
   WECHAT_APP_SECRET=你的微信AppSecret
   WECHAT_REDIRECT_URI=http://localhost:3000/auth/wechat/callback
   
   # JWT配置
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **重启开发服务器**：
   ```bash
   # 停止服务器（Ctrl+C）
   npm run dev
   ```

#### 2.2 测试微信登录流程

1. **点击微信登录按钮**
   - 应该打开微信授权页面
   - 使用微信扫码授权

2. **授权回调测试**
   - 授权成功后应该跳转到回调页面
   - 检查回调页面是否显示"登录成功"
   - 检查是否自动跳转到首页

3. **登录状态检查**
   - 打开浏览器开发者工具（F12）
   - 查看Console标签页的日志
   - 查看Application标签页的LocalStorage
   - 检查是否有 `auth_token` 和 `user_info`

### 测试3：PC OpenSDK功能测试

#### 3.1 访问测试页面
- 访问：http://localhost:3000/test-wechat
- 检查测试页面是否正常加载

#### 3.2 运行功能测试
1. **点击"运行所有测试"按钮**
   - 检查环境变量配置测试
   - 检查微信API连接测试
   - 检查数据库连接测试
   - 检查PC OpenSDK加载测试

2. **查看测试结果**
   - 绿色✅：测试通过
   - 红色❌：测试失败
   - 黄色⚠️：需要配置

#### 3.3 测试PC OpenSDK功能
1. **启动PC小程序测试**
   ```javascript
   // 在浏览器控制台执行
   const wechatLogin = document.querySelector('[data-testid="wechat-login"]');
   if (wechatLogin && wechatLogin.launchMiniProgram) {
     wechatLogin.launchMiniProgram('小程序userName', '页面路径', 'ticket');
   }
   ```

2. **分享PC小程序测试**
   ```javascript
   // 在浏览器控制台执行
   const wechatLogin = document.querySelector('[data-testid="wechat-login"]');
   if (wechatLogin && wechatLogin.shareMiniProgram) {
     wechatLogin.shareMiniProgram('小程序userName', '页面路径', '标题', '描述', '链接', '图片', 'ticket');
   }
   ```

### 测试4：安全认证功能测试

#### 4.1 生成安全认证密钥
```bash
# 生成RSA密钥对和AES密钥
npm run wechat:keys
```

#### 4.2 配置安全认证
1. **上传公钥到微信开放平台**
   - 进入微信开放平台
   - 找到"API安全"配置
   - 上传生成的 `certs/wechat_public_key.pem`

2. **下载平台证书**
   - 下载平台证书
   - 保存为 `certs/wechat_platform_cert.pem`

3. **更新环境变量**
   ```bash
   # 复制安全认证配置
   cp wechat-security-config.env .env.local
   
   # 编辑配置文件
   nano .env.local
   ```

#### 4.3 测试安全认证
```bash
# 检查安全认证状态
curl http://localhost:3000/api/auth/wechat/verify
```

### 测试5：数据库功能测试

#### 5.1 初始化数据库
```bash
# 运行数据库初始化脚本
npm run db:init
```

#### 5.2 测试数据库连接
```bash
# 测试数据库API
curl http://localhost:3000/api/test/database
```

## 🔍 测试检查点

### 基础功能检查
- [ ] 登录页面正常加载
- [ ] 微信登录按钮显示正确
- [ ] 导航栏登录按钮工作正常
- [ ] 移动端菜单登录按钮工作正常

### 微信登录检查
- [ ] 微信授权页面正常打开
- [ ] 扫码授权流程正常
- [ ] 授权回调页面正常显示
- [ ] 登录成功后自动跳转
- [ ] 用户信息正确存储到LocalStorage

### PC OpenSDK检查
- [ ] SDK正确加载
- [ ] 频率限制正常工作
- [ ] 错误处理机制正常
- [ ] 启动小程序功能正常
- [ ] 分享小程序功能正常

### 安全认证检查
- [ ] 密钥文件正确生成
- [ ] 公钥正确上传到微信开放平台
- [ ] 平台证书正确下载和配置
- [ ] 签名验证正常工作
- [ ] 接口加密正常工作

### 数据库检查
- [ ] 数据库连接正常
- [ ] 用户表结构正确
- [ ] 微信相关字段正确
- [ ] 用户信息正确存储

## 🐛 常见问题排查

### 问题1：微信登录按钮不显示
**原因**：环境变量未配置
**解决**：
```bash
# 检查环境变量
npm run wechat:check

# 配置环境变量
nano .env.local
```

### 问题2：授权回调失败
**原因**：回调域名配置错误
**解决**：
1. 检查微信开放平台中的回调域名配置
2. 确保与 `WECHAT_REDIRECT_URI` 一致

### 问题3：PC OpenSDK无法使用
**原因**：SDK加载失败或权限不足
**解决**：
1. 检查是否在HTTPS环境下测试
2. 检查是否已开通PC OpenSDK权限
3. 检查频率限制是否超限

### 问题4：数据库连接失败
**原因**：数据库配置错误
**解决**：
```bash
# 检查数据库配置
curl http://localhost:3000/api/test/database

# 检查环境变量
echo $MYSQL_HOST
echo $MYSQL_USER
```

## 📊 测试报告模板

### 测试环境
- 操作系统：
- 浏览器：
- Node.js版本：
- 测试时间：

### 测试结果
- 基础功能：✅/❌
- 微信登录：✅/❌
- PC OpenSDK：✅/❌
- 安全认证：✅/❌
- 数据库：✅/❌

### 发现问题
1. 问题描述：
2. 重现步骤：
3. 预期结果：
4. 实际结果：

### 建议改进
1. 功能改进建议：
2. 性能优化建议：
3. 用户体验改进：

## 🎯 快速测试命令

```bash
# 一键测试所有功能
npm run wechat:check && npm run wechat:security && echo "访问 http://localhost:3000/test-wechat 进行完整测试"
```

## 📞 技术支持

如果测试过程中遇到问题：

1. **查看日志**：检查浏览器控制台和服务器日志
2. **检查配置**：运行 `npm run wechat:check`
3. **查看文档**：参考 `WECHAT_LOGIN_GUIDE.md`
4. **联系支持**：提供详细的错误信息和测试环境

---

**测试指南版本**: v1.0  
**最后更新**: 2025-10-19  
**适用版本**: Next.js 14+, React 18+

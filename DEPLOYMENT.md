# 爱情AI音乐 - 部署更新指南

## 📋 服务器信息

- **服务器地址**: 82.156.230.140
- **SSH用户**: root
- **SSH密钥**: `/Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem`
- **项目路径**: `/opt/app`
- **域名**: https://aimusic.sale, https://www.aimusic.sale

---

## 🚀 快速部署更新

### 方式一：完整部署（推荐）

当您修改了代码需要更新服务器时，在**本地项目根目录**执行以下命令：

```bash
# 1. 本地构建测试（确保没有错误）
npm run build

# 2. 打包项目文件
tar -czf loveAIMusic.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='*.tar.gz' .

# 3. 上传到服务器
scp -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem loveAIMusic.tar.gz root@82.156.230.140:/opt/

# 4. 登录服务器并部署
ssh -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem root@82.156.230.140

# 5. 在服务器上执行以下命令
cd /opt
rm -rf /opt/app.bak
mv /opt/app /opt/app.bak
mkdir -p /opt/app
tar -xzf /opt/loveAIMusic.tar.gz -C /opt/app
cd /opt/app

# 6. 安装依赖并构建
npm install
npm run build

# 7. 重启应用
pm2 restart loveaimusic

# 8. 查看运行状态
pm2 status
pm2 logs loveaimusic --lines 50

# 9. 退出SSH
exit
```

---

### 方式二：仅更新代码（快速）

如果只是修改了少量代码文件，可以使用增量更新：

```bash
# 1. 上传修改的文件（以 lib/aiService.ts 为例）
scp -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem \
  /Users/xing/WEB/loveAIMusic/lib/aiService.ts \
  root@82.156.230.140:/opt/app/lib/

# 2. 登录服务器
ssh -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem root@82.156.230.140

# 3. 重新构建并重启
cd /opt/app
npm run build
pm2 restart loveaimusic

# 4. 退出
exit
```

---

## 🔧 常用运维命令

### PM2 进程管理

```bash
# 查看应用状态
pm2 status

# 查看日志（实时）
pm2 logs loveaimusic

# 查看最近50行日志
pm2 logs loveaimusic --lines 50

# 重启应用
pm2 restart loveaimusic

# 停止应用
pm2 stop loveaimusic

# 启动应用
pm2 start loveaimusic

# 删除应用
pm2 delete loveaimusic

# 保存PM2配置（开机自启）
pm2 save

# 查看详细信息
pm2 show loveaimusic
```

### Nginx 管理

```bash
# 测试配置文件
nginx -t

# 重新加载配置（不中断服务）
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 状态
systemctl status nginx

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log
```

### 端口检查

```bash
# 查看端口监听状态
ss -tlnp | grep nginx
ss -tlnp | grep node

# 测试本地3000端口
curl http://localhost:3000

# 测试80端口
curl -I http://aimusic.sale

# 测试443端口
curl -I https://aimusic.sale
```

---

## 📝 环境变量配置

生产环境配置文件位于：`/opt/app/.env.production`

如需修改环境变量：

```bash
# 登录服务器
ssh -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem root@82.156.230.140

# 编辑环境变量
vi /opt/app/.env.production

# 重新构建和重启
cd /opt/app
npm run build
pm2 restart loveaimusic
```

**重要环境变量：**
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://aimusic.sale`
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `DEEPSEEK_API_KEY`
- `YUNWU_API_KEY`
- `TENCENT_COS_SECRET_ID`, `TENCENT_COS_SECRET_KEY`, `TENCENT_COS_BUCKET`

---

## 🔍 故障排查

### 1. 网站无法访问

```bash
# 检查应用是否运行
pm2 status

# 检查3000端口
curl http://localhost:3000

# 检查Nginx状态
systemctl status nginx

# 查看Nginx错误日志
tail -50 /var/log/nginx/error.log

# 查看应用日志
pm2 logs loveaimusic --lines 100
```

### 2. 构建失败

```bash
# 查看构建错误
cd /opt/app
npm run build 2>&1 | tee build.log

# 检查Node.js版本（需要18+）
node --version

# 清理缓存重新安装
rm -rf node_modules .next
npm install
npm run build
```

### 3. HTTPS证书问题

```bash
# 检查证书文件
ls -la /etc/nginx/ssl/aimusic.sale/

# 检查证书有效期
openssl x509 -in /etc/nginx/ssl/aimusic.sale/aimusic.sale_bundle.crt -noout -dates

# 测试SSL配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 4. 数据库连接失败

```bash
# 测试数据库连接
mysql -h sh-cdb-5kh978ne.sql.tencentcdb.com -P 20500 -u akashic -p

# 检查应用日志中的数据库错误
pm2 logs loveaimusic | grep -i mysql
pm2 logs loveaimusic | grep -i database
```

---

## 📊 性能监控

### 查看服务器资源使用

```bash
# 内存使用
free -h

# 磁盘使用
df -h

# CPU使用
top

# 查看PM2监控
pm2 monit
```

### 查看应用性能

```bash
# PM2详细信息
pm2 show loveaimusic

# 查看内存使用
pm2 list

# 重启释放内存
pm2 restart loveaimusic
```

---

## 🔄 回滚到上一版本

如果新版本有问题，可以快速回滚：

```bash
# 登录服务器
ssh -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem root@82.156.230.140

# 停止当前应用
pm2 stop loveaimusic

# 恢复备份
cd /opt
rm -rf /opt/app
mv /opt/app.bak /opt/app

# 重启应用
cd /opt/app
pm2 restart loveaimusic

# 退出
exit
```

---

## 🔐 SSL证书更新

当SSL证书过期需要更新时：

```bash
# 1. 本地解压新证书
cd /Users/xing/Downloads
unzip aimusic.sale_new.zip

# 2. 上传新证书
scp -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem \
  aimusic.sale_other/aimusic.sale.key \
  aimusic.sale_other/aimusic.sale_bundle.crt \
  root@82.156.230.140:/etc/nginx/ssl/aimusic.sale/

# 3. 登录服务器重启Nginx
ssh -i /Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem root@82.156.230.140
nginx -t
systemctl reload nginx
exit
```

---

## 📱 一键部署脚本

为了更方便，您可以创建一个本地部署脚本：

创建文件 `/Users/xing/WEB/loveAIMusic/deploy.sh`：

```bash
#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}   爱情AI音乐 - 自动部署脚本${NC}"
echo -e "${GREEN}=====================================${NC}"

# 配置
SSH_KEY="/Users/xing/Documents/xing_scopeOL/key/teng_bj20250314.pem"
SERVER="root@82.156.230.140"
PROJECT_DIR="/Users/xing/WEB/loveAIMusic"

cd $PROJECT_DIR

# 1. 本地构建测试
echo -e "\n${YELLOW}[1/7] 本地构建测试...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 本地构建失败，请检查错误后重试${NC}"
    exit 1
fi

# 2. 打包项目
echo -e "\n${YELLOW}[2/7] 打包项目文件...${NC}"
tar -czf loveAIMusic.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='*.tar.gz' .

# 3. 上传到服务器
echo -e "\n${YELLOW}[3/7] 上传到服务器...${NC}"
scp -i $SSH_KEY loveAIMusic.tar.gz $SERVER:/opt/

# 4. 备份旧版本
echo -e "\n${YELLOW}[4/7] 备份旧版本...${NC}"
ssh -i $SSH_KEY $SERVER "cd /opt && rm -rf /opt/app.bak && mv /opt/app /opt/app.bak && mkdir -p /opt/app"

# 5. 解压并安装
echo -e "\n${YELLOW}[5/7] 解压并安装依赖...${NC}"
ssh -i $SSH_KEY $SERVER "cd /opt && tar -xzf loveAIMusic.tar.gz -C /opt/app && cd /opt/app && npm install"

# 6. 服务器构建
echo -e "\n${YELLOW}[6/7] 服务器构建...${NC}"
ssh -i $SSH_KEY $SERVER "cd /opt/app && npm run build"

# 7. 重启应用
echo -e "\n${YELLOW}[7/7] 重启应用...${NC}"
ssh -i $SSH_KEY $SERVER "pm2 restart loveaimusic"

# 清理本地打包文件
rm loveAIMusic.tar.gz

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}   ✅ 部署完成！${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "\n访问地址: ${GREEN}https://aimusic.sale${NC}\n"

# 显示应用状态
echo -e "${YELLOW}应用状态:${NC}"
ssh -i $SSH_KEY $SERVER "pm2 status loveaimusic"

echo -e "\n${YELLOW}查看实时日志请运行:${NC}"
echo "ssh -i $SSH_KEY $SERVER \"pm2 logs loveaimusic\""
```

**使用方法：**

```bash
# 给脚本添加执行权限
chmod +x /Users/xing/WEB/loveAIMusic/deploy.sh

# 执行部署
cd /Users/xing/WEB/loveAIMusic
./deploy.sh
```

---

## ⚠️ 注意事项

1. **部署前务必本地测试**：确保 `npm run build` 在本地成功
2. **备份重要数据**：每次部署会自动备份到 `/opt/app.bak`
3. **检查日志**：部署后务必查看应用日志确认正常运行
4. **数据库迁移**：如有数据库结构变更，需手动执行SQL脚本
5. **环境变量**：修改环境变量后需重新构建和重启
6. **SSL证书**：证书有效期通常1年，到期前需更新
7. **服务器资源**：注意监控服务器CPU、内存、磁盘使用情况

---

## 📞 紧急联系

如遇紧急问题无法解决：

1. 回滚到备份版本：`mv /opt/app.bak /opt/app && pm2 restart loveaimusic`
2. 查看详细日志：`pm2 logs loveaimusic --lines 200`
3. 检查系统日志：`journalctl -xe`
4. 重启所有服务：`pm2 restart all && systemctl restart nginx`

---

**最后更新**: 2025-10-19  
**文档版本**: v1.0



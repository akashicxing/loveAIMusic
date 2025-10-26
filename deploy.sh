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



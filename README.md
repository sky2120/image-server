# 图片服务器 (Image Server)

一个简单的图片服务器，支持图片上传、下载和浏览功能。

## 功能特性

- ✅ 图片上传：支持JPG、PNG、GIF、WebP格式
- ✅ 图片下载：直接下载任意图片文件
- ✅ 图片浏览：网格视图展示所有上传的图片
- ✅ 文件命名：使用ISO时间戳命名，确保文件名唯一
- ✅ API接口：提供完整的RESTful API
- ✅ 响应式界面：支持移动端和桌面端
- ✅ API文档：详细的API使用说明

## 技术栈

- Node.js
- Express.js
- Multer (文件上传)
- CORS (跨域支持)

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/sky2120/image-server.git
cd image-server
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务器

```bash
npm start
```

或者使用开发模式（支持热重载）：

```bash
npm run dev
```

### 4. 访问服务器

- 主页面：http://localhost:3000
- API文档：http://localhost:3000/api-docs

## API接口

### 1. 上传图片

**接口地址**: `POST /upload`

**参数**:
- `image`: 图片文件（multipart/form-data格式）

**示例请求（Python）**:
```python
import requests

server_url = 'http://your-server-domain.com'
url = f'{server_url}/upload'
files = {'image': open('example.jpg', 'rb')}

response = requests.post(url, files=files)
print(response.status_code)
print(response.text)
```

**响应**:
- 成功：返回上传成功页面，包含文件详细信息
- 失败：返回错误提示页面

### 2. 获取图片列表

**接口地址**: `GET /images`

**示例请求（Python）**:
```python
import requests

server_url = 'http://your-server-domain.com'
url = f'{server_url}/images'
response = requests.get(url)

if response.status_code == 200:
    images = response.json()
    print(images)
else:
    print(f'Error: {response.status_code}')
```

**响应**:
```json
[
  {
    "filename": "2026-03-30T14-35-22-456Z.jpg",
    "originalname": "example.jpg",
    "size": 10240,
    "createdAt": "2026-03-30T14:35:22.456Z"
  }
]
```

### 3. 下载图片

**接口地址**: `GET /uploads/:filename`

**参数**:
- `filename`: 图片文件名

**示例请求（Python）**:
```python
import requests

server_url = 'http://your-server-domain.com'
filename = '2026-03-30T14-35-22-456Z.jpg'
url = f'{server_url}/uploads/{filename}'

response = requests.get(url)

if response.status_code == 200:
    with open('downloaded.jpg', 'wb') as f:
        f.write(response.content)
    print('Image downloaded successfully')
else:
    print(f'Error: {response.status_code}')
```

**响应**:
- 成功：返回图片文件（二进制数据）
- 失败：返回404错误

## 文件命名规则

上传的图片文件将使用ISO时间戳命名：
```
YYYY-MM-DDTHH-MM-SS-SSSZ.ext
```

示例：
- `2026-03-30T14-35-22-456Z.jpg`
- `2026-03-30T15-45-12-789Z.png`

## 支持的图片格式

- JPEG/JPG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## 部署建议

### 生产环境部署

1. **使用PM2管理进程**
```bash
npm install pm2 -g
pm2 start server.js --name image-server
pm2 save
pm2 startup
```

2. **使用Nginx反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **配置HTTPS**
```bash
# 使用Let's Encrypt获取SSL证书
certbot --nginx -d your-domain.com
```

### 环境变量

可以通过环境变量配置服务器端口：
```bash
PORT=8080 npm start
```

## 项目结构

```
image-server/
├── server.js          # 主服务器文件
├── package.json       # 项目配置和依赖
├── README.md         # 项目说明文档
└── uploads/          # 上传的图片存储目录（自动创建）
```

## 注意事项

1. **文件安全**：服务器没有实现用户认证，任何人都可以上传和访问图片
2. **存储管理**：定期清理上传目录，避免磁盘空间占用过大
3. **文件大小**：默认没有限制上传文件大小，生产环境建议配置大小限制
4. **备份**：定期备份上传的图片文件

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

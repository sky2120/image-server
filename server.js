const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname);
    cb(null, timestamp + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>图片服务器</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                text-align: center;
                color: #333;
            }
            .upload-section {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input[type="file"] {
                margin-bottom: 10px;
            }
            button {
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background: #45a049;
            }
            .images-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
            }
            .image-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                text-align: center;
            }
            .image-card img {
                width: 100%;
                height: 150px;
                object-fit: cover;
            }
            .image-info {
                padding: 10px;
            }
            .image-info p {
                margin: 5px 0;
                font-size: 14px;
            }
            .download-link {
                display: inline-block;
                margin-top: 10px;
                padding: 5px 10px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-size: 12px;
            }
            .download-link:hover {
                background: #0056b3;
            }
            .api-link {
                display: inline-block;
                margin-bottom: 20px;
                padding: 8px 16px;
                background: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }
            .api-link:hover {
                background: #5a6268;
            }
        </style>
    </head>
    <body>
        <h1>图片服务器</h1>
        <a href="/api-docs" class="api-link">查看API文档</a>
        
        <div class="upload-section">
            <h2>上传图片</h2>
            <form id="upload-form" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="image">选择图片:</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                </div>
                <button type="submit">上传</button>
            </form>
            <div id="upload-message" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
        </div>
        
        <h2>图片库</h2>
        <div id="images-grid" class="images-grid">
            加载中...
        </div>
        
        <script>
            async function loadImages() {
                try {
                    const response = await fetch('/images');
                    const images = await response.json();
                    const grid = document.getElementById('images-grid');
                    
                    if (images.length === 0) {
                        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">暂无图片</p>';
                        return;
                    }
                    
                    grid.innerHTML = images.map(image => {
                        return '<div class="image-card">' +
                            '<img src="/uploads/' + image.filename + '" alt="' + image.originalname + '">' +
                            '<div class="image-info">' +
                                '<p>' + image.originalname + '</p>' +
                                '<p>' + (image.size / 1024).toFixed(2) + ' KB</p>' +
                                '<a href="/uploads/' + image.filename + '" download="' + image.originalname + '" class="download-link">下载</a>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                } catch (error) {
                    console.error('Error loading images:', error);
                }
            }
            
            document.addEventListener('DOMContentLoaded', () => {
                loadImages();
                
                const uploadForm = document.getElementById('upload-form');
                const uploadMessage = document.getElementById('upload-message');
                
                uploadForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(uploadForm);
                    
                    try {
                        uploadMessage.style.display = 'block';
                        uploadMessage.textContent = '上传中...';
                        uploadMessage.style.backgroundColor = '#fff3cd';
                        uploadMessage.style.color = '#856404';
                        
                        const response = await fetch('/upload', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            uploadMessage.textContent = '上传成功！';
                            uploadMessage.style.backgroundColor = '#d4edda';
                            uploadMessage.style.color = '#155724';
                            
                            // 重新加载图片列表
                            setTimeout(() => {
                                loadImages();
                                uploadForm.reset();
                                uploadMessage.style.display = 'none';
                            }, 1500);
                        } else {
                            uploadMessage.textContent = '上传失败：' + result.error;
                            uploadMessage.style.backgroundColor = '#f8d7da';
                            uploadMessage.style.color = '#721c24';
                        }
                    } catch (error) {
                        uploadMessage.textContent = '上传失败：' + error.message;
                        uploadMessage.style.backgroundColor = '#f8d7da';
                        uploadMessage.style.color = '#721c24';
                    }
                });
            });
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/api-docs', (req, res) => {
  const apiDocs = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API文档 - 图片服务器</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                text-align: center;
                color: #333;
            }
            h2 {
                color: #495057;
                border-bottom: 2px solid #dee2e6;
                padding-bottom: 10px;
                margin-top: 40px;
            }
            h3 {
                color: #212529;
                margin-top: 30px;
            }
            .api-endpoint {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #007bff;
            }
            .method {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 14px;
                margin-right: 10px;
            }
            .method-get {
                background: #28a745;
                color: white;
            }
            .method-post {
                background: #007bff;
                color: white;
            }
            .url {
                font-family: monospace;
                font-size: 16px;
                color: #495057;
            }
            .description {
                margin: 10px 0;
                color: #6c757d;
            }
            .parameters {
                margin: 15px 0;
            }
            .parameter {
                margin: 5px 0;
                padding-left: 20px;
            }
            .code-block {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                font-family: monospace;
                overflow-x: auto;
                margin: 15px 0;
                border: 1px solid #dee2e6;
            }
            .back-link {
                display: inline-block;
                margin-bottom: 20px;
                padding: 8px 16px;
                background: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }
            .back-link:hover {
                background: #5a6268;
            }
        </style>
    </head>
    <body>
        <h1>API文档</h1>
        <a href="/" class="back-link">返回首页</a>
        
        <h2>图片服务器API</h2>
        <p>本API提供图片上传、下载和浏览功能</p>
        
        <h3>端点列表</h3>
        
        <div class="api-endpoint">
            <span class="method method-get">GET</span>
            <span class="url">/</span>
            <div class="description">主页面，提供图片上传和浏览界面</div>
        </div>
        
        <div class="api-endpoint">
            <span class="method method-post">POST</span>
            <span class="url">/upload</span>
            <div class="description">上传图片文件</div>
            <div class="parameters">
                <strong>参数：</strong>
                <div class="parameter">image (文件): 图片文件（支持JPG、PNG、GIF、WebP格式）</div>
            </div>
            <h4>示例请求（表单提交）</h4>
            <div class="code-block">
&lt;form action="/upload" method="post" enctype="multipart/form-data"&gt;
  &lt;input type="file" name="image" accept="image/*"&gt;
  &lt;button type="submit"&gt;上传&lt;/button&gt;
&lt;/form&gt;
            </div>
            <h4>示例请求（Python）</h4>
            <div class="code-block">
import requests

server_url = 'http://your-server-domain.com'
url = f'{server_url}/upload'
files = {'image': open('example.jpg', 'rb')}

response = requests.post(url, files=files)
print(response.status_code)
print(response.text)
            </div>
            <h4>示例响应（成功）</h4>
            <div class="code-block">
// 状态码: 200
{
  "success": true,
  "message": "图片已成功上传！",
  "file": {
    "originalname": "example.jpg",
    "filename": "2026-03-31T00-15-30-123Z.jpg",
    "size": 10240,
    "mimetype": "image/jpeg",
    "url": "/uploads/2026-03-31T00-15-30-123Z.jpg"
  }
}
</div>
            <h4>示例响应（失败）</h4>
            <div class="code-block">
// 状态码: 400
{
  "success": false,
  "error": "请选择图片文件"
}
</div>
        </div>
        
        <div class="api-endpoint">
            <span class="method method-get">GET</span>
            <span class="url">/images</span>
            <div class="description">获取所有图片列表（JSON格式）</div>
            <h4>示例请求（Python）</h4>
            <div class="code-block">
import requests

server_url = 'http://your-server-domain.com'
url = f'{server_url}/images'
response = requests.get(url)

if response.status_code == 200:
    images = response.json()
    print(images)
else:
    print(f'Error: {response.status_code}')
            </div>
            <h4>示例响应（成功）</h4>
            <div class="code-block">
// 状态码: 200
[
  {
    "filename": "2026-03-30T14-35-22-456Z.jpg",
    "originalname": "example.jpg",
    "size": 10240,
    "createdAt": "2026-03-30T14:35:22.456Z"
  }
]
</div>
            <h4>示例响应（失败）</h4>
            <div class="code-block">
// 状态码: 500
{"error": "Failed to read directory"}
</div>
        </div>
        
        <div class="api-endpoint">
            <span class="method method-get">GET</span>
            <span class="url">/uploads/:filename</span>
            <div class="description">下载指定图片文件</div>
            <div class="parameters">
                <strong>路径参数：</strong>
                <div class="parameter">filename: 图片文件名</div>
            </div>
            <h4>示例请求（Python）</h4>
            <div class="code-block">
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
            </div>
            <h4>示例响应（成功）</h4>
            <div class="code-block">
// 状态码: 200
图片文件（二进制数据）
</div>
            <h4>示例响应（失败）</h4>
            <div class="code-block">
// 状态码: 404
Cannot GET /uploads/nonexistent.jpg
</div>
        </div>
        
        <div class="api-endpoint">
            <span class="method method-get">GET</span>
            <span class="url">/api-docs</span>
            <div class="description">查看API文档</div>
        </div>
        
        <h2>支持的图片格式</h2>
        <ul>
            <li>JPEG/JPG (.jpg, .jpeg)</li>
            <li>PNG (.png)</li>
            <li>GIF (.gif)</li>
            <li>WebP (.webp)</li>
        </ul>
        
        <h2>文件命名规则</h2>
        <p>上传的图片文件将使用ISO时间戳命名：YYYY-MM-DDTHH-MM-SS-SSSZ.ext</p>
        <p>例如：2026-03-30T14-35-22-456Z.jpg</p>
    </body>
    </html>
  `;
  res.send(apiDocs);
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: '请选择图片文件'
    });
  }
  
  res.json({
    success: true,
    message: '图片已成功上传！',
    file: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    }
  });
});

app.get('/images', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read directory' });
    }
    
    const images = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const originalname = filename.replace(/^image-\d+-/, '');
      
      return {
        filename,
        originalname: originalname.replace(/-\d+\./, '.'),
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    res.json(images);
  });
});

app.use('/uploads', express.static(uploadsDir));

app.listen(PORT, () => {
  console.log(`Image server running on http://localhost:${PORT}`);
});

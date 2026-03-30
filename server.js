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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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
  res.send(`
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
        </style>
    </head>
    <body>
        <h1>图片服务器</h1>
        
        <div class="upload-section">
            <h2>上传图片</h2>
            <form action="/upload" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="image">选择图片:</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                </div>
                <button type="submit">上传</button>
            </form>
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
                    
                    grid.innerHTML = images.map(image => `
                        <div class="image-card">
                            <img src="/uploads/${image.filename}" alt="${image.originalname}">
                            <div class="image-info">
                                <p>${image.originalname}</p>
                                <p>${(image.size / 1024).toFixed(2)} KB</p>
                                <a href="/uploads/${image.filename}" download="${image.originalname}" class="download-link">下载</a>
                            </div>
                        </div>
                    `).join('');
                } catch (error) {
                    console.error('Error loading images:', error);
                }
            }
            
            document.addEventListener('DOMContentLoaded', loadImages);
        </script>
    </body>
    </html>
  `);
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'Image uploaded successfully',
    file: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
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
        originalname: originalname.replace(/-(\\d+)\\./, '.'),
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

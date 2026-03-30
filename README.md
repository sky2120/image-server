# Image Server

A simple image server for uploading, downloading and browsing images.

## Features

- Upload images
- Download images
- Browse images in grid view
- Support for JPG, PNG, GIF, and WebP formats
- Responsive web interface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sky2120/image-server.git
cd image-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and go to http://localhost:3000

## Usage

- **Upload**: Click "选择图片" button to upload an image
- **Browse**: View all uploaded images in grid format
- **Download**: Click the "下载" button to download any image

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload an image
- `GET /images` - Get list of all images
- `GET /uploads/:filename` - Download a specific image

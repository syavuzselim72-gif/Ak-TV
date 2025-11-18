# AkışTV Backend

Bu klasör AkışTV uygulamasının backend kısmını içerir.

## Gereksinimler

- Node.js (v14 veya üstü)
- MongoDB

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Ortam değişkenlerini ayarlayın (`.env` dosyası oluşturun):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/akistv
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

3. Sunucuyu başlatın:
```bash
npm start
```

## Render.com Üzerinde Deploy

1. Render.com'a giriş yapın
2. Yeni bir "Web Service" oluşturun
3. GitHub repository'sini bağlayın
4. Build command: `npm install`
5. Start command: `npm start`
6. Ortam değişkenlerini Render dashboard'undan ayarlayın
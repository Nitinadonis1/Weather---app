# Weather Forecast App - GitHub Pages Deployment

A modern, interactive weather forecast web application with glassmorphism design, dark/light mode, and 5-day forecast.

## 🌐 Live Demo

Visit: `https://yourusername.github.io/weather-app/`

## 🚀 How to Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click **New Repository**
3. Name it: `weather-app` (or any name you prefer)
4. Make it **Public**
5. Click **Create Repository**

### Step 2: Upload These Files

Upload all files from this folder to your new repository:
- `index.html`
- `static/css/style.css`
- `static/js/app.js`

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings**
2. Scroll down to **Pages** section (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

### Step 4: Access Your Site

After 1-2 minutes, your site will be live at:
```
https://yourusername.github.io/weather-app/
```

Replace `yourusername` with your actual GitHub username.

## ✨ Features

- 🌡️ Real-time weather data (demo mode)
- 📅 5-day forecast
- 🔍 City search
- 📍 Location detection
- 🌓 Dark/Light mode toggle
- 📊 Temperature trend charts
- 📱 Mobile responsive
- ✨ Glassmorphism UI

## 📝 Note

This version uses **demo/mock data** for weather information. For real weather data, integrate with OpenWeatherMap API by modifying the `app.js` file.

## 🛠️ Custom Domain (Optional)

To use a custom domain like `weather.yourdomain.com`:

1. In your repository, go to **Settings > Pages**
2. Under **Custom domain**, enter your domain
3. Add a CNAME record in your DNS pointing to `yourusername.github.io`
4. Create a file named `CNAME` in your repository with your domain name

## 📄 License

MIT License - feel free to use and modify!

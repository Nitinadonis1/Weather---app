# 🌤️ Weather Forecast Web Application

A modern, fully interactive weather forecast web application built with **Python Flask** backend and **HTML/CSS/JavaScript** frontend. Features real-time weather data, 5-day forecasts, geolocation, dark/light mode, and beautiful glassmorphism UI.

![Weather App Preview](https://via.placeholder.com/800x400?text=Weather+App+Preview)

## ✨ Features

### Core Features
- 🌡️ **Real-time Weather Data** - Current temperature, humidity, wind speed, and more
- 📅 **5-Day Forecast** - Extended weather predictions with daily summaries
- 🔍 **City Search** - Search weather by city name worldwide
- 📍 **Auto-Location Detection** - Automatically detect user location using browser geolocation
- 🌓 **Dark/Light Mode** - Toggle between themes with system preference detection
- 🌡️ **Temperature Units** - Switch between Celsius (°C) and Fahrenheit (°F)
- 📊 **Temperature Charts** - Visual temperature trends using Chart.js

### UI/UX Features
- ✨ **Glassmorphism Design** - Modern frosted glass UI effects
- 🎨 **Responsive Design** - Mobile-first, works on all devices
- 🔄 **AJAX Loading** - No page reloads, smooth user experience
- ⏳ **Loading Animations** - Animated spinner while fetching data
- ⚠️ **Error Handling** - User-friendly error messages for invalid cities
- 🎯 **Smooth Transitions** - Hover effects and animated elements
- 🖼️ **Dynamic Weather Icons** - Icons change based on weather conditions

## 🛠️ Tech Stack

### Backend
- **Python 3.7+**
- **Flask** - Web framework
- **Requests** - HTTP library for API calls
- **OpenWeatherMap API** - Weather data provider

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js** - Temperature trend charts
- **Google Fonts** - Inter & Poppins typography

## 📁 Project Structure

```
weather-app/
├── app.py                 # Flask backend application
├── README.md             # This file
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Main stylesheet with glassmorphism
    └── js/
        └── app.js        # Frontend JavaScript with Fetch API
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- OpenWeatherMap API key (free)

### Step 1: Get OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Sign up for a free account
3. Navigate to **API Keys** in your account dashboard
4. Copy your API key (or generate a new one)

### Step 2: Clone or Download the Project

```bash
# Clone the repository (or download and extract)
git clone <repository-url>
cd weather-app
```

### Step 3: Set Up Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenWeatherMap API key:

```env
OPENWEATHER_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

Or set the environment variable directly:

```bash
# Windows Command Prompt
set OPENWEATHER_API_KEY=your_api_key_here

# Windows PowerShell
$env:OPENWEATHER_API_KEY="your_api_key_here"

# macOS/Linux
export OPENWEATHER_API_KEY=your_api_key_here
```

### Step 6: Run the Application

```bash
python app.py
```

The application will be available at: **http://localhost:5000**

## 📖 Usage Guide

### Searching for Weather
1. Enter a city name in the search box
2. Click **Search** or press **Enter**
3. Weather data will load without page refresh

### Using My Location
1. Click the **📍 My Location** button
2. Allow location access when prompted
3. App will show weather for your current location

### Switching Temperature Units
- Click the **°C/°F** toggle to switch between Celsius and Fahrenheit
- Your preference is saved for future visits

### Toggling Dark/Light Mode
- Click the **☀️/🌙** toggle in the header
- App detects your system preference automatically

### Viewing Forecast
- Scroll down to see the **5-day forecast** cards
- Click any forecast card for detailed info
- View the **temperature trend chart** for visual analysis

## 🔌 API Endpoints

The Flask backend provides the following REST API endpoints:

### Get Current Weather by City
```
GET /api/weather?city={city_name}&units={metric|imperial}
```

**Response:**
```json
{
  "city": "London",
  "country": "GB",
  "temperature": 15,
  "feels_like": 13,
  "humidity": 72,
  "wind_speed": 3.5,
  "weather_description": "Scattered clouds",
  "icon_url": "https://openweathermap.org/img/wn/03d@2x.png",
  "sunrise": "06:23",
  "sunset": "19:45"
}
```

### Get 5-Day Forecast by City
```
GET /api/forecast?city={city_name}&units={metric|imperial}
```

### Get Weather by Coordinates
```
GET /api/weather/coords?lat={latitude}&lon={longitude}&units={metric|imperial}
```

### Get Forecast by Coordinates
```
GET /api/forecast/coords?lat={latitude}&lon={longitude}&units={metric|imperial}
```

## 🎨 Customization

### Changing Default City
Edit `app.js` and modify the `DEFAULT_CITY` constant:

```javascript
const CONFIG = {
    DEFAULT_CITY: 'Your City',
    // ...
};
```

### Modifying Colors
Edit CSS variables in `style.css`:

```css
:root {
    --gradient-start-light: #667eea;
    --gradient-end-light: #764ba2;
    --accent-light: #4299e1;
    /* ... */
}
```

### Adding More Weather Details
The OpenWeatherMap API provides additional data. Modify the `get_weather()` function in `app.py` to include more fields.

## 🐛 Troubleshooting

### Common Issues

#### "City not found" Error
- Check the spelling of the city name
- Try adding the country code (e.g., "London, UK")
- Some smaller cities may not be available

#### "Failed to fetch weather data" Error
- Check your internet connection
- Verify your OpenWeatherMap API key is correct
- Check the Flask server is running

#### Geolocation Not Working
- Ensure you're using HTTPS (required for geolocation)
- Allow location permissions in your browser
- Try a different browser if issues persist

#### API Rate Limit Exceeded
- Free OpenWeatherMap accounts have rate limits
- Wait a minute before making more requests
- Consider upgrading to a paid plan for heavy usage

### Debug Mode
Run Flask in debug mode for detailed error messages:

```bash
export FLASK_ENV=development
export FLASK_DEBUG=True
python app.py
```

## 🚢 Deployment

### Deploy to Heroku

1. Create a `Procfile`:
```
web: gunicorn app:app
```

2. Create `runtime.txt`:
```
python-3.9.7
```

3. Deploy:
```bash
heroku create your-app-name
heroku config:set OPENWEATHER_API_KEY=your_api_key
git push heroku main
```

### Deploy to Python Anywhere

1. Upload files via FTP or Git
2. Create a virtual environment
3. Install requirements
4. Configure WSGI file
5. Set environment variables in dashboard

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t weather-app .
docker run -p 5000:5000 -e OPENWEATHER_API_KEY=your_key weather-app
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather API
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Google Fonts](https://fonts.google.com/) for typography
- [Flask](https://flask.palletsprojects.com/) for the web framework

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the maintainer.

---

Made with ❤️ and ☕ | Weather Forecast App

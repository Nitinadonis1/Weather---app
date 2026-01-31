/**
 * Weather Forecast Web Application - JavaScript
 * =============================================
 * Handles all frontend functionality including:
 * - API calls to Flask backend
 * - Geolocation for auto-detect
 * - Dark/Light mode toggle
 * - Temperature unit conversion
 * - Chart.js integration for temperature trends
 * - Loading animations and error handling
 * 
 * @author AI Assistant
 * @date 2026-01-31
 */

// ==================== Configuration ====================
const CONFIG = {
    // API Endpoints
    API_BASE_URL: '', // Relative to current domain
    ENDPOINTS: {
        weather: '/api/weather',
        forecast: '/api/forecast',
        weatherByCoords: '/api/weather/coords',
        forecastByCoords: '/api/forecast/coords'
    },
    
    // Default settings
    DEFAULT_CITY: 'London',
    DEFAULT_UNITS: 'metric', // 'metric' or 'imperial'
    
    // Local storage keys
    STORAGE_KEYS: {
        theme: 'weatherApp_theme',
        units: 'weatherApp_units',
        lastCity: 'weatherApp_lastCity'
    },
    
    // Demo mode - uses mock data instead of API
    DEMO_MODE: true
};

// ==================== State Management ====================
const state = {
    currentCity: '',
    units: CONFIG.DEFAULT_UNITS,
    theme: 'light',
    weatherData: null,
    forecastData: null,
    chart: null
};

// ==================== DOM Elements ====================
const elements = {
    // Search elements
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    
    // Theme toggle
    themeToggle: document.getElementById('themeToggle'),
    
    // Unit toggle
    unitSwitch: document.getElementById('unitSwitch'),
    unitLabels: document.querySelectorAll('.unit-label'),
    
    // Loading and error containers
    loadingContainer: document.getElementById('loadingContainer'),
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    errorBtn: document.getElementById('errorBtn'),
    
    // Weather content
    weatherContent: document.getElementById('weatherContent'),
    
    // Current weather elements
    cityName: document.getElementById('cityName'),
    countryName: document.getElementById('countryName'),
    currentDate: document.getElementById('currentDate'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    tempUnit: document.getElementById('tempUnit'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),
    tempMin: document.getElementById('tempMin'),
    tempMax: document.getElementById('tempMax'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    visibility: document.getElementById('visibility'),
    cloudiness: document.getElementById('cloudiness'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    
    // Chart
    tempChart: document.getElementById('tempChart'),
    
    // Forecast
    forecastGrid: document.getElementById('forecastGrid')
};

// ==================== Utility Functions ====================

/**
 * Format current date for display
 * @returns {string} Formatted date string
 */
function formatCurrentDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
}

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} fromUnit - Source unit ('metric' or 'imperial')
 * @param {string} toUnit - Target unit ('metric' or 'imperial')
 * @returns {number} Converted temperature
 */
function convertTemp(temp, fromUnit, toUnit) {
    if (fromUnit === toUnit) return temp;
    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return Math.round((temp * 9/5) + 32);
    }
    if (fromUnit === 'imperial' && toUnit === 'metric') {
        return Math.round((temp - 32) * 5/9);
    }
    return temp;
}

/**
 * Get wind speed unit based on temperature unit system
 * @param {string} units - Unit system ('metric' or 'imperial')
 * @returns {string} Wind speed unit
 */
function getWindSpeedUnit(units) {
    return units === 'metric' ? 'm/s' : 'mph';
}

/**
 * Get temperature symbol
 * @param {string} units - Unit system ('metric' or 'imperial')
 * @returns {string} Temperature symbol (°C or °F)
 */
function getTempSymbol(units) {
    return units === 'metric' ? '°C' : '°F';
}

/**
 * Show loading animation
 */
function showLoading() {
    elements.loadingContainer.classList.add('active');
    elements.weatherContent.classList.remove('active');
    elements.errorContainer.classList.remove('active');
}

/**
 * Hide loading animation
 */
function hideLoading() {
    elements.loadingContainer.classList.remove('active');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    hideLoading();
    elements.weatherContent.classList.remove('active');
    elements.errorContainer.classList.add('active');
    elements.errorMessage.textContent = message;
}

/**
 * Show weather content
 */
function showWeatherContent() {
    hideLoading();
    elements.errorContainer.classList.remove('active');
    elements.weatherContent.classList.add('active');
}

// ==================== Theme Management ====================

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme);
    if (savedTheme) {
        state.theme = savedTheme;
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'light';
    }
    applyTheme();
}

/**
 * Apply current theme to document
 */
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, state.theme);
    
    // Update chart if it exists
    if (state.chart) {
        updateChartTheme();
    }
}

// ==================== Unit Management ====================

/**
 * Initialize temperature units from localStorage
 */
function initUnits() {
    const savedUnits = localStorage.getItem(CONFIG.STORAGE_KEYS.units);
    if (savedUnits) {
        state.units = savedUnits;
    }
    applyUnits();
}

/**
 * Apply current units to UI
 */
function applyUnits() {
    // Update toggle switch
    if (state.units === 'imperial') {
        elements.unitSwitch.classList.add('fahrenheit');
    } else {
        elements.unitSwitch.classList.remove('fahrenheit');
    }
    
    // Update labels
    elements.unitLabels[0].classList.toggle('active', state.units === 'metric');
    elements.unitLabels[1].classList.toggle('active', state.units === 'imperial');
}

/**
 * Toggle between metric and imperial units
 */
function toggleUnits() {
    state.units = state.units === 'metric' ? 'imperial' : 'metric';
    applyUnits();
    localStorage.setItem(CONFIG.STORAGE_KEYS.units, state.units);
    
    // Refresh data with new units
    if (state.currentCity) {
        fetchWeatherData(state.currentCity);
    }
}

// ==================== Mock Data for Demo Mode ====================
const DEMO_WEATHER_DATA = {
    'London': {
        city: 'London',
        country: 'GB',
        temperature: 15,
        feels_like: 13,
        temp_min: 12,
        temp_max: 18,
        humidity: 72,
        pressure: 1015,
        wind_speed: 3.5,
        wind_deg: 220,
        visibility: 10,
        clouds: 40,
        weather_main: 'Clouds',
        weather_description: 'Scattered Clouds',
        weather_icon: '03d',
        icon_url: 'https://openweathermap.org/img/wn/03d@2x.png',
        sunrise: '06:23',
        sunset: '19:45',
        timezone: 0,
        dt: 1700000000
    },
    'New York': {
        city: 'New York',
        country: 'US',
        temperature: 22,
        feels_like: 21,
        temp_min: 18,
        temp_max: 25,
        humidity: 65,
        pressure: 1018,
        wind_speed: 4.2,
        wind_deg: 180,
        visibility: 10,
        clouds: 20,
        weather_main: 'Clear',
        weather_description: 'Clear Sky',
        weather_icon: '01d',
        icon_url: 'https://openweathermap.org/img/wn/01d@2x.png',
        sunrise: '06:15',
        sunset: '19:30',
        timezone: -14400,
        dt: 1700000000
    },
    'Tokyo': {
        city: 'Tokyo',
        country: 'JP',
        temperature: 28,
        feels_like: 31,
        temp_min: 25,
        temp_max: 30,
        humidity: 80,
        pressure: 1010,
        wind_speed: 2.8,
        wind_deg: 90,
        visibility: 8,
        clouds: 60,
        weather_main: 'Rain',
        weather_description: 'Light Rain',
        weather_icon: '10d',
        icon_url: 'https://openweathermap.org/img/wn/10d@2x.png',
        sunrise: '05:30',
        sunset: '18:15',
        timezone: 32400,
        dt: 1700000000
    },
    'Paris': {
        city: 'Paris',
        country: 'FR',
        temperature: 18,
        feels_like: 17,
        temp_min: 15,
        temp_max: 21,
        humidity: 68,
        pressure: 1020,
        wind_speed: 3.0,
        wind_deg: 270,
        visibility: 10,
        clouds: 30,
        weather_main: 'Clear',
        weather_description: 'Few Clouds',
        weather_icon: '02d',
        icon_url: 'https://openweathermap.org/img/wn/02d@2x.png',
        sunrise: '06:45',
        sunset: '20:00',
        timezone: 3600,
        dt: 1700000000
    },
    'Sydney': {
        city: 'Sydney',
        country: 'AU',
        temperature: 25,
        feels_like: 26,
        temp_min: 22,
        temp_max: 28,
        humidity: 55,
        pressure: 1015,
        wind_speed: 5.5,
        wind_deg: 120,
        visibility: 10,
        clouds: 10,
        weather_main: 'Clear',
        weather_description: 'Sunny',
        weather_icon: '01d',
        icon_url: 'https://openweathermap.org/img/wn/01d@2x.png',
        sunrise: '06:00',
        sunset: '19:45',
        timezone: 36000,
        dt: 1700000000
    }
};

function generateDemoForecast(cityName, baseTemp) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const icons = ['01d', '02d', '03d', '04d', '09d', '10d'];
    const descriptions = ['Sunny', 'Few Clouds', 'Scattered Clouds', 'Broken Clouds', 'Light Rain', 'Showers'];
    
    const forecasts = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        
        const tempVariation = Math.floor(Math.random() * 7) - 3;
        const tempMax = baseTemp + tempVariation;
        const tempMin = tempMax - Math.floor(Math.random() * 5) - 5;
        
        const iconIdx = Math.floor(Math.random() * icons.length);
        
        forecasts.push({
            date: `${dayName}, ${monthName} ${String(date.getDate()).padStart(2, '0')}`,
            date_full: date.toISOString().split('T')[0],
            temp_min: tempMin,
            temp_max: tempMax,
            temp_avg: Math.floor((tempMax + tempMin) / 2),
            humidity: Math.floor(Math.random() * 40) + 50,
            wind_speed: (Math.random() * 6 + 2).toFixed(1),
            weather_icon: icons[iconIdx],
            icon_url: `https://openweathermap.org/img/wn/${icons[iconIdx]}@2x.png`,
            weather_description: descriptions[iconIdx],
            weather_main: descriptions[iconIdx].split()[0]
        });
    }
    
    return forecasts;
}

function getDemoWeatherData(city, units) {
    let cityKey = Object.keys(DEMO_WEATHER_DATA).find(k => k.toLowerCase() === city.toLowerCase());
    if (!cityKey) cityKey = 'London';
    
    const data = { ...DEMO_WEATHER_DATA[cityKey] };
    data.city = city;
    
    if (units === 'imperial') {
        data.temperature = Math.round((data.temperature * 9/5) + 32);
        data.feels_like = Math.round((data.feels_like * 9/5) + 32);
        data.temp_min = Math.round((data.temp_min * 9/5) + 32);
        data.temp_max = Math.round((data.temp_max * 9/5) + 32);
    }
    
    data.units = units;
    return data;
}

function getDemoForecastData(city, units) {
    let cityKey = Object.keys(DEMO_WEATHER_DATA).find(k => k.toLowerCase() === city.toLowerCase());
    if (!cityKey) cityKey = 'London';
    
    const baseTemp = DEMO_WEATHER_DATA[cityKey].temperature;
    let forecast = generateDemoForecast(city, baseTemp);
    
    if (units === 'imperial') {
        forecast = forecast.map(day => ({
            ...day,
            temp_min: Math.round((day.temp_min * 9/5) + 32),
            temp_max: Math.round((day.temp_max * 9/5) + 32),
            temp_avg: Math.round((day.temp_avg * 9/5) + 32)
        }));
    }
    
    return {
        city: city,
        country: DEMO_WEATHER_DATA[cityKey].country,
        forecast: forecast,
        units: units
    };
}

// ==================== API Functions ====================

/**
 * Fetch current weather data for a city
 * @param {string} city - City name
 */
async function fetchWeatherData(city) {
    showLoading();
    
    // Demo mode - use mock data
    if (CONFIG.DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        const data = getDemoWeatherData(city, state.units);
        state.weatherData = data;
        state.currentCity = data.city;
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.lastCity, data.city);
        
        const forecastData = getDemoForecastData(city, state.units);
        state.forecastData = forecastData;
        
        updateCurrentWeatherUI();
        updateForecastUI();
        updateChart();
        showWeatherContent();
        return;
    }
    
    try {
        const response = await fetch(
            `${CONFIG.ENDPOINTS.weather}?city=${encodeURIComponent(city)}&units=${state.units}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        state.weatherData = data;
        state.currentCity = data.city;
        
        // Save last searched city
        localStorage.setItem(CONFIG.STORAGE_KEYS.lastCity, data.city);
        
        // Fetch forecast data
        await fetchForecastData(city);
        
        // Update UI
        updateCurrentWeatherUI();
        showWeatherContent();
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    }
}

/**
 * Fetch 5-day forecast data for a city
 * @param {string} city - City name
 */
async function fetchForecastData(city) {
    try {
        const response = await fetch(
            `${CONFIG.ENDPOINTS.forecast}?city=${encodeURIComponent(city)}&units=${state.units}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch forecast data');
        }
        
        const data = await response.json();
        state.forecastData = data;
        
        // Update UI
        updateForecastUI();
        updateChart();
        
    } catch (error) {
        console.error('Error fetching forecast:', error);
        // Don't show error for forecast - current weather is more important
    }
}

/**
 * Fetch weather data by geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchWeatherByCoords(lat, lon) {
    showLoading();
    
    // Demo mode - use mock data
    if (CONFIG.DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const data = getDemoWeatherData('London', state.units);
        data.coords = { lat, lon };
        state.weatherData = data;
        state.currentCity = data.city;
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.lastCity, data.city);
        
        const forecastData = getDemoForecastData('London', state.units);
        state.forecastData = forecastData;
        
        updateCurrentWeatherUI();
        updateForecastUI();
        updateChart();
        showWeatherContent();
        return;
    }
    
    try {
        const response = await fetch(
            `${CONFIG.ENDPOINTS.weatherByCoords}?lat=${lat}&lon=${lon}&units=${state.units}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        state.weatherData = data;
        state.currentCity = data.city;
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.lastCity, data.city);
        
        // Fetch forecast by coordinates
        await fetchForecastByCoords(lat, lon);
        
        // Update UI
        updateCurrentWeatherUI();
        showWeatherContent();
        
    } catch (error) {
        console.error('Error fetching weather by coords:', error);
        showError(error.message || 'Failed to fetch weather data for your location.');
    }
}

/**
 * Fetch forecast data by geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchForecastByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${CONFIG.ENDPOINTS.forecastByCoords}?lat=${lat}&lon=${lon}&units=${state.units}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch forecast data');
        }
        
        const data = await response.json();
        state.forecastData = data;
        
        updateForecastUI();
        updateChart();
        
    } catch (error) {
        console.error('Error fetching forecast by coords:', error);
    }
}

// ==================== UI Update Functions ====================

/**
 * Update current weather UI with fetched data
 */
function updateCurrentWeatherUI() {
    if (!state.weatherData) return;
    
    const data = state.weatherData;
    
    // Update location info
    elements.cityName.textContent = data.city;
    elements.countryName.textContent = data.country;
    elements.currentDate.textContent = formatCurrentDate();
    
    // Update weather icon
    elements.weatherIcon.src = data.icon_url;
    elements.weatherIcon.alt = data.weather_description;
    
    // Update temperature
    elements.temperature.textContent = data.temperature;
    elements.tempUnit.textContent = getTempSymbol(state.units);
    
    // Update description
    elements.weatherDescription.textContent = data.weather_description;
    elements.feelsLike.textContent = `${data.feels_like}°`;
    
    // Update temp range
    elements.tempMin.textContent = data.temp_min;
    elements.tempMax.textContent = data.temp_max;
    
    // Update details
    elements.humidity.textContent = `${data.humidity}%`;
    elements.windSpeed.textContent = `${data.wind_speed} ${getWindSpeedUnit(state.units)}`;
    elements.visibility.textContent = `${data.visibility} km`;
    elements.cloudiness.textContent = `${data.clouds}%`;
    elements.sunrise.textContent = data.sunrise;
    elements.sunset.textContent = data.sunset;
}

/**
 * Update forecast UI with fetched data
 */
function updateForecastUI() {
    if (!state.forecastData || !state.forecastData.forecast) return;
    
    const forecast = state.forecastData.forecast;
    elements.forecastGrid.innerHTML = '';
    
    forecast.forEach((day, index) => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
        forecastCard.classList.add('fade-in');
        
        forecastCard.innerHTML = `
            <p class="forecast-date">${day.date}</p>
            <img src="${day.icon_url}" alt="${day.weather_description}" class="forecast-icon">
            <div class="forecast-temps">
                <span class="forecast-temp-high">${day.temp_max}°</span>
                <span class="forecast-temp-low">${day.temp_min}°</span>
            </div>
            <p class="forecast-desc">${day.weather_description}</p>
            <div class="forecast-details">
                <span>💧 ${day.humidity}%</span>
                <span>💨 ${day.wind_speed}</span>
            </div>
        `;
        
        elements.forecastGrid.appendChild(forecastCard);
    });
}

// ==================== Chart Functions ====================

/**
 * Initialize or update the temperature chart
 */
function updateChart() {
    if (!state.forecastData || !state.forecastData.forecast) return;
    
    const forecast = state.forecastData.forecast;
    const labels = forecast.map(day => day.date.split(',')[0]); // Just the day name
    const maxTemps = forecast.map(day => day.temp_max);
    const minTemps = forecast.map(day => day.temp_min);
    
    const ctx = elements.tempChart.getContext('2d');
    
    // Destroy existing chart if it exists
    if (state.chart) {
        state.chart.destroy();
    }
    
    // Get theme colors
    const isDark = state.theme === 'dark';
    const textColor = isDark ? '#f1f5f9' : '#1a202c';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `High (${getTempSymbol(state.units)})`,
                    data: maxTemps,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: `Low (${getTempSymbol(state.units)})`,
                    data: minTemps,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return value + '°';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Update chart theme when switching between light/dark modes
 */
function updateChartTheme() {
    if (state.chart) {
        updateChart();
    }
}

// ==================== Geolocation ====================

/**
 * Get user's current location using browser geolocation API
 */
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser. Please search for a city manually.');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        // Error callback
        (error) => {
            let errorMsg = 'Unable to retrieve your location.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location access denied. Please enable location permissions or search manually.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information unavailable. Please search for a city manually.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out. Please try again or search manually.';
                    break;
            }
            showError(errorMsg);
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 600000 // 10 minutes
        }
    );
}

// ==================== Event Handlers ====================

/**
 * Handle search button click
 */
function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        elements.cityInput.focus();
        elements.cityInput.classList.add('shake');
        setTimeout(() => elements.cityInput.classList.remove('shake'), 500);
    }
}

/**
 * Handle Enter key press in search input
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
}

/**
 * Handle error button click (retry)
 */
function handleRetry() {
    const lastCity = state.currentCity || CONFIG.DEFAULT_CITY;
    fetchWeatherData(lastCity);
}

// ==================== Initialization ====================

/**
 * Initialize the application
 */
function init() {
    // Initialize theme and units
    initTheme();
    initUnits();
    
    // Add event listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', handleKeyPress);
    elements.locationBtn.addEventListener('click', getUserLocation);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.unitSwitch.addEventListener('click', toggleUnits);
    elements.errorBtn.addEventListener('click', handleRetry);
    
    // Load last searched city or default
    const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.lastCity);
    if (lastCity) {
        elements.cityInput.value = lastCity;
        fetchWeatherData(lastCity);
    } else {
        // Try to get user location on first load
        getUserLocation();
    }
}

// ==================== Start Application ====================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', init);

// Add shake animation for input validation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .shake {
        animation: shake 0.3s ease-in-out;
        border-color: #ef4444 !important;
    }
`;
document.head.appendChild(style);

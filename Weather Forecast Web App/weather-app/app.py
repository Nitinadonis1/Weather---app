"""
Weather Forecast Web Application
================================
A Flask-based web application that provides real-time weather data
and 5-day forecasts using the OpenWeatherMap API.

Author: AI Assistant
Date: 2026-01-31
"""

from flask import Flask, render_template, jsonify, request
import requests
import os
import random
from datetime import datetime

# Initialize Flask application
app = Flask(__name__)

# OpenWeatherMap API Configuration
# Get your free API key from: https://openweathermap.org/api
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'demo')
BASE_URL = 'https://api.openweathermap.org/data/2.5'

# Demo mode - provides mock data when API key is not available
DEMO_MODE = OPENWEATHER_API_KEY == 'demo' or OPENWEATHER_API_KEY == 'your_api_key_here'

# Mock weather data for demo mode
DEMO_WEATHER_DATA = {
    'London': {
        'city': 'London',
        'country': 'GB',
        'temperature': 15,
        'feels_like': 13,
        'temp_min': 12,
        'temp_max': 18,
        'humidity': 72,
        'pressure': 1015,
        'wind_speed': 3.5,
        'wind_deg': 220,
        'visibility': 10,
        'clouds': 40,
        'weather_main': 'Clouds',
        'weather_description': 'Scattered Clouds',
        'weather_icon': '03d',
        'icon_url': 'https://openweathermap.org/img/wn/03d@2x.png',
        'sunrise': '06:23',
        'sunset': '19:45',
        'timezone': 0,
        'dt': 1700000000
    },
    'New York': {
        'city': 'New York',
        'country': 'US',
        'temperature': 22,
        'feels_like': 21,
        'temp_min': 18,
        'temp_max': 25,
        'humidity': 65,
        'pressure': 1018,
        'wind_speed': 4.2,
        'wind_deg': 180,
        'visibility': 10,
        'clouds': 20,
        'weather_main': 'Clear',
        'weather_description': 'Clear Sky',
        'weather_icon': '01d',
        'icon_url': 'https://openweathermap.org/img/wn/01d@2x.png',
        'sunrise': '06:15',
        'sunset': '19:30',
        'timezone': -14400,
        'dt': 1700000000
    },
    'Tokyo': {
        'city': 'Tokyo',
        'country': 'JP',
        'temperature': 28,
        'feels_like': 31,
        'temp_min': 25,
        'temp_max': 30,
        'humidity': 80,
        'pressure': 1010,
        'wind_speed': 2.8,
        'wind_deg': 90,
        'visibility': 8,
        'clouds': 60,
        'weather_main': 'Rain',
        'weather_description': 'Light Rain',
        'weather_icon': '10d',
        'icon_url': 'https://openweathermap.org/img/wn/10d@2x.png',
        'sunrise': '05:30',
        'sunset': '18:15',
        'timezone': 32400,
        'dt': 1700000000
    },
    'Paris': {
        'city': 'Paris',
        'country': 'FR',
        'temperature': 18,
        'feels_like': 17,
        'temp_min': 15,
        'temp_max': 21,
        'humidity': 68,
        'pressure': 1020,
        'wind_speed': 3.0,
        'wind_deg': 270,
        'visibility': 10,
        'clouds': 30,
        'weather_main': 'Clear',
        'weather_description': 'Few Clouds',
        'weather_icon': '02d',
        'icon_url': 'https://openweathermap.org/img/wn/02d@2x.png',
        'sunrise': '06:45',
        'sunset': '20:00',
        'timezone': 3600,
        'dt': 1700000000
    },
    'Sydney': {
        'city': 'Sydney',
        'country': 'AU',
        'temperature': 25,
        'feels_like': 26,
        'temp_min': 22,
        'temp_max': 28,
        'humidity': 55,
        'pressure': 1015,
        'wind_speed': 5.5,
        'wind_deg': 120,
        'visibility': 10,
        'clouds': 10,
        'weather_main': 'Clear',
        'weather_description': 'Sunny',
        'weather_icon': '01d',
        'icon_url': 'https://openweathermap.org/img/wn/01d@2x.png',
        'sunrise': '06:00',
        'sunset': '19:45',
        'timezone': 36000,
        'dt': 1700000000
    }
}

DEMO_FORECAST_DATA = {
    'London': [
        {'date': 'Mon, Feb 03', 'date_full': '2026-02-03', 'temp_min': 10, 'temp_max': 16, 'temp_avg': 13, 'humidity': 70, 'wind_speed': 3.2, 'weather_icon': '03d', 'icon_url': 'https://openweathermap.org/img/wn/03d@2x.png', 'weather_description': 'Scattered Clouds', 'weather_main': 'Clouds'},
        {'date': 'Tue, Feb 04', 'date_full': '2026-02-04', 'temp_min': 9, 'temp_max': 14, 'temp_avg': 11, 'humidity': 75, 'wind_speed': 4.0, 'weather_icon': '04d', 'icon_url': 'https://openweathermap.org/img/wn/04d@2x.png', 'weather_description': 'Broken Clouds', 'weather_main': 'Clouds'},
        {'date': 'Wed, Feb 05', 'date_full': '2026-02-05', 'temp_min': 11, 'temp_max': 17, 'temp_avg': 14, 'humidity': 65, 'wind_speed': 2.8, 'weather_icon': '02d', 'icon_url': 'https://openweathermap.org/img/wn/02d@2x.png', 'weather_description': 'Few Clouds', 'weather_main': 'Clear'},
        {'date': 'Thu, Feb 06', 'date_full': '2026-02-06', 'temp_min': 8, 'temp_max': 13, 'temp_avg': 10, 'humidity': 80, 'wind_speed': 5.5, 'weather_icon': '10d', 'icon_url': 'https://openweathermap.org/img/wn/10d@2x.png', 'weather_description': 'Light Rain', 'weather_main': 'Rain'},
        {'date': 'Fri, Feb 07', 'date_full': '2026-02-07', 'temp_min': 7, 'temp_max': 12, 'temp_avg': 9, 'humidity': 85, 'wind_speed': 6.0, 'weather_icon': '09d', 'icon_url': 'https://openweathermap.org/img/wn/09d@2x.png', 'weather_description': 'Showers', 'weather_main': 'Rain'}
    ]
}

# Generate forecast for any city based on base weather data
def generate_demo_forecast(city_name, base_temp):
    """Generate a 5-day forecast for demo mode."""
    import random
    forecasts = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    icons = ['01d', '02d', '03d', '04d', '09d', '10d']
    descriptions = ['Sunny', 'Few Clouds', 'Scattered Clouds', 'Broken Clouds', 'Light Rain', 'Showers']
    
    today = datetime.now()
    
    for i in range(5):
        date = today.replace(day=today.day + i)
        day_name = days[date.weekday()]
        month_name = months[date.month - 1]
        
        temp_variation = random.randint(-3, 3)
        temp_max = base_temp + temp_variation
        temp_min = temp_max - random.randint(5, 10)
        
        icon_idx = random.randint(0, len(icons) - 1)
        
        forecasts.append({
            'date': f"{day_name}, {month_name} {date.day:02d}",
            'date_full': date.strftime('%Y-%m-%d'),
            'temp_min': temp_min,
            'temp_max': temp_max,
            'temp_avg': (temp_max + temp_min) // 2,
            'humidity': random.randint(50, 90),
            'wind_speed': round(random.uniform(2, 8), 1),
            'weather_icon': icons[icon_idx],
            'icon_url': f"https://openweathermap.org/img/wn/{icons[icon_idx]}@2x.png",
            'weather_description': descriptions[icon_idx],
            'weather_main': descriptions[icon_idx].split()[0]
        })
    
    return forecasts


def get_weather_icon_url(icon_code):
    """
    Generate URL for weather icon from OpenWeatherMap.
    
    Args:
        icon_code (str): Weather icon code from API
        
    Returns:
        str: Complete URL to weather icon image
    """
    return f"https://openweathermap.org/img/wn/{icon_code}@2x.png"


def format_timestamp(timestamp, timezone_offset=0):
    """
    Convert Unix timestamp to readable time format.
    
    Args:
        timestamp (int): Unix timestamp
        timezone_offset (int): Timezone offset in seconds
        
    Returns:
        str: Formatted time string (HH:MM)
    """
    utc_time = datetime.utcfromtimestamp(timestamp)
    local_time = datetime.utcfromtimestamp(timestamp + timezone_offset)
    return local_time.strftime('%H:%M')


def format_date(timestamp, timezone_offset=0):
    """
    Convert Unix timestamp to readable date format.
    
    Args:
        timestamp (int): Unix timestamp
        timezone_offset (int): Timezone offset in seconds
        
    Returns:
        str: Formatted date string (Day, Month Date)
    """
    local_time = datetime.utcfromtimestamp(timestamp + timezone_offset)
    return local_time.strftime('%a, %b %d')


def celsius_to_fahrenheit(celsius):
    """
    Convert Celsius to Fahrenheit.
    
    Args:
        celsius (float): Temperature in Celsius
        
    Returns:
        float: Temperature in Fahrenheit
    """
    return (celsius * 9/5) + 32


@app.route('/')
def index():
    """
    Render the main page of the weather application.
    
    Returns:
        Rendered HTML template for the weather app
    """
    return render_template('index.html')


@app.route('/api/weather', methods=['GET'])
def get_weather():
    """
    API endpoint to fetch current weather data for a city.
    
    Query Parameters:
        city (str): Name of the city
        units (str): Temperature units (metric/imperial), default: metric
        
    Returns:
        JSON: Weather data including temperature, humidity, wind speed, etc.
    """
    city = request.args.get('city', '').strip()
    units = request.args.get('units', 'metric')
    
    # Validate city parameter
    if not city:
        return jsonify({
            'error': 'City name is required',
            'message': 'Please provide a valid city name'
        }), 400
    
    # Demo mode - return mock data
    if DEMO_MODE:
        # Find matching city or use default
        city_key = None
        for key in DEMO_WEATHER_DATA:
            if key.lower() == city.lower():
                city_key = key
                break
        
        if city_key is None:
            # Return first available city as fallback
            city_key = list(DEMO_WEATHER_DATA.keys())[0]
        
        data = DEMO_WEATHER_DATA[city_key].copy()
        data['city'] = city  # Use the searched city name
        
        # Convert units if needed
        if units == 'imperial':
            data['temperature'] = round(celsius_to_fahrenheit(data['temperature']))
            data['feels_like'] = round(celsius_to_fahrenheit(data['feels_like']))
            data['temp_min'] = round(celsius_to_fahrenheit(data['temp_min']))
            data['temp_max'] = round(celsius_to_fahrenheit(data['temp_max']))
        
        data['units'] = units
        return jsonify(data)
    
    try:
        # Build API request for current weather
        params = {
            'q': city,
            'appid': OPENWEATHER_API_KEY,
            'units': units
        }
        
        response = requests.get(f'{BASE_URL}/weather', params=params, timeout=10)
        
        # Handle API errors
        if response.status_code == 404:
            return jsonify({
                'error': 'City not found',
                'message': f'Could not find weather data for "{city}". Please check the spelling.'
            }), 404
        elif response.status_code != 200:
            return jsonify({
                'error': 'API Error',
                'message': 'Failed to fetch weather data. Please try again later.'
            }), 500
        
        data = response.json()
        
        # Extract and format weather data
        weather_data = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': round(data['main']['temp']),
            'feels_like': round(data['main']['feels_like']),
            'temp_min': round(data['main']['temp_min']),
            'temp_max': round(data['main']['temp_max']),
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'wind_deg': data['wind'].get('deg', 0),
            'visibility': data.get('visibility', 0) / 1000,  # Convert to km
            'clouds': data['clouds']['all'],
            'weather_main': data['weather'][0]['main'],
            'weather_description': data['weather'][0]['description'].title(),
            'weather_icon': data['weather'][0]['icon'],
            'icon_url': get_weather_icon_url(data['weather'][0]['icon']),
            'sunrise': format_timestamp(data['sys']['sunrise'], data['timezone']),
            'sunset': format_timestamp(data['sys']['sunset'], data['timezone']),
            'timezone': data['timezone'],
            'dt': data['dt'],
            'units': units
        }
        
        return jsonify(weather_data)
        
    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'Timeout',
            'message': 'Request timed out. Please check your internet connection.'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Network Error',
            'message': 'Failed to connect to weather service. Please try again.'
        }), 503
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': 'An unexpected error occurred. Please try again.'
        }), 500


@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    API endpoint to fetch 5-day weather forecast for a city.
    
    Query Parameters:
        city (str): Name of the city
        units (str): Temperature units (metric/imperial), default: metric
        
    Returns:
        JSON: 5-day forecast data with daily summaries
    """
    city = request.args.get('city', '').strip()
    units = request.args.get('units', 'metric')
    
    # Validate city parameter
    if not city:
        return jsonify({
            'error': 'City name is required',
            'message': 'Please provide a valid city name'
        }), 400
    
    # Demo mode - return mock forecast data
    if DEMO_MODE:
        # Find matching city or use default
        city_key = None
        for key in DEMO_WEATHER_DATA:
            if key.lower() == city.lower():
                city_key = key
                break
        
        if city_key is None:
            city_key = list(DEMO_WEATHER_DATA.keys())[0]
        
        # Get base temperature for generating forecast
        base_temp = DEMO_WEATHER_DATA[city_key]['temperature']
        forecast = generate_demo_forecast(city, base_temp)
        
        # Convert units if needed
        if units == 'imperial':
            for day in forecast:
                day['temp_min'] = round(celsius_to_fahrenheit(day['temp_min']))
                day['temp_max'] = round(celsius_to_fahrenheit(day['temp_max']))
                day['temp_avg'] = round(celsius_to_fahrenheit(day['temp_avg']))
        
        return jsonify({
            'city': city,
            'country': DEMO_WEATHER_DATA[city_key]['country'],
            'forecast': forecast,
            'units': units
        })
    
    try:
        # Build API request for 5-day forecast
        params = {
            'q': city,
            'appid': OPENWEATHER_API_KEY,
            'units': units
        }
        
        response = requests.get(f'{BASE_URL}/forecast', params=params, timeout=10)
        
        # Handle API errors
        if response.status_code == 404:
            return jsonify({
                'error': 'City not found',
                'message': f'Could not find forecast data for "{city}"'
            }), 404
        elif response.status_code != 200:
            return jsonify({
                'error': 'API Error',
                'message': 'Failed to fetch forecast data'
            }), 500
        
        data = response.json()
        
        # Process forecast data - group by day
        daily_forecasts = {}
        
        for item in data['list']:
            # Get date from timestamp
            date_obj = datetime.utcfromtimestamp(item['dt'] + data['city']['timezone'])
            date_key = date_obj.strftime('%Y-%m-%d')
            
            if date_key not in daily_forecasts:
                daily_forecasts[date_key] = {
                    'date': date_obj.strftime('%a, %b %d'),
                    'date_full': date_obj.strftime('%Y-%m-%d'),
                    'temps': [],
                    'weather_icons': [],
                    'weather_descriptions': [],
                    'humidity': [],
                    'wind_speed': [],
                    'timestamps': []
                }
            
            daily_forecasts[date_key]['temps'].append(item['main']['temp'])
            daily_forecasts[date_key]['weather_icons'].append(item['weather'][0]['icon'])
            daily_forecasts[date_key]['weather_descriptions'].append(item['weather'][0]['description'])
            daily_forecasts[date_key]['humidity'].append(item['main']['humidity'])
            daily_forecasts[date_key]['wind_speed'].append(item['wind']['speed'])
            daily_forecasts[date_key]['timestamps'].append(item['dt'])
        
        # Calculate daily summaries
        forecast_list = []
        for date_key, day_data in list(daily_forecasts.items())[:5]:  # Limit to 5 days
            # Get most frequent weather icon and description
            icon_counts = {}
            desc_counts = {}
            for icon in day_data['weather_icons']:
                icon_counts[icon] = icon_counts.get(icon, 0) + 1
            for desc in day_data['weather_descriptions']:
                desc_counts[desc] = desc_counts.get(desc, 0) + 1
            
            most_common_icon = max(icon_counts, key=icon_counts.get)
            most_common_desc = max(desc_counts, key=desc_counts.get)
            
            forecast_list.append({
                'date': day_data['date'],
                'date_full': day_data['date_full'],
                'temp_min': round(min(day_data['temps'])),
                'temp_max': round(max(day_data['temps'])),
                'temp_avg': round(sum(day_data['temps']) / len(day_data['temps'])),
                'humidity': round(sum(day_data['humidity']) / len(day_data['humidity'])),
                'wind_speed': round(max(day_data['wind_speed']), 1),
                'weather_icon': most_common_icon,
                'icon_url': get_weather_icon_url(most_common_icon),
                'weather_description': most_common_desc.title(),
                'weather_main': most_common_desc.split()[0].title()
            })
        
        return jsonify({
            'city': data['city']['name'],
            'country': data['city']['country'],
            'forecast': forecast_list,
            'units': units
        })
        
    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'Timeout',
            'message': 'Request timed out'
        }), 504
    except requests.exceptions.RequestException:
        return jsonify({
            'error': 'Network Error',
            'message': 'Failed to connect to weather service'
        }), 503
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': 'An unexpected error occurred'
        }), 500


@app.route('/api/weather/coords', methods=['GET'])
def get_weather_by_coords():
    """
    API endpoint to fetch weather data by geographic coordinates.
    Used for auto-detecting user location.
    
    Query Parameters:
        lat (float): Latitude
        lon (float): Longitude
        units (str): Temperature units (metric/imperial), default: metric
        
    Returns:
        JSON: Weather data for the specified coordinates
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    units = request.args.get('units', 'metric')
    
    # Validate coordinates
    if lat is None or lon is None:
        return jsonify({
            'error': 'Coordinates required',
            'message': 'Please provide valid latitude and longitude'
        }), 400
    
    # Demo mode - return London data for any coordinates
    if DEMO_MODE:
        data = DEMO_WEATHER_DATA['London'].copy()
        data['coords'] = {'lat': lat, 'lon': lon}
        
        if units == 'imperial':
            data['temperature'] = round(celsius_to_fahrenheit(data['temperature']))
            data['feels_like'] = round(celsius_to_fahrenheit(data['feels_like']))
            data['temp_min'] = round(celsius_to_fahrenheit(data['temp_min']))
            data['temp_max'] = round(celsius_to_fahrenheit(data['temp_max']))
        
        data['units'] = units
        return jsonify(data)
    
    try:
        # Build API request for current weather by coordinates
        params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': units
        }
        
        response = requests.get(f'{BASE_URL}/weather', params=params, timeout=10)
        
        if response.status_code != 200:
            return jsonify({
                'error': 'API Error',
                'message': 'Failed to fetch weather data for location'
            }), 500
        
        data = response.json()
        
        # Extract and format weather data
        weather_data = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': round(data['main']['temp']),
            'feels_like': round(data['main']['feels_like']),
            'temp_min': round(data['main']['temp_min']),
            'temp_max': round(data['main']['temp_max']),
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'wind_deg': data['wind'].get('deg', 0),
            'visibility': data.get('visibility', 0) / 1000,
            'clouds': data['clouds']['all'],
            'weather_main': data['weather'][0]['main'],
            'weather_description': data['weather'][0]['description'].title(),
            'weather_icon': data['weather'][0]['icon'],
            'icon_url': get_weather_icon_url(data['weather'][0]['icon']),
            'sunrise': format_timestamp(data['sys']['sunrise'], data['timezone']),
            'sunset': format_timestamp(data['sys']['sunset'], data['timezone']),
            'timezone': data['timezone'],
            'dt': data['dt'],
            'units': units,
            'coords': {'lat': lat, 'lon': lon}
        }
        
        return jsonify(weather_data)
        
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': 'Failed to fetch weather data'
        }), 500


@app.route('/api/forecast/coords', methods=['GET'])
def get_forecast_by_coords():
    """
    API endpoint to fetch 5-day forecast by geographic coordinates.
    
    Query Parameters:
        lat (float): Latitude
        lon (float): Longitude
        units (str): Temperature units (metric/imperial), default: metric
        
    Returns:
        JSON: 5-day forecast data for the specified coordinates
    """
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    units = request.args.get('units', 'metric')
    
    if lat is None or lon is None:
        return jsonify({
            'error': 'Coordinates required',
            'message': 'Please provide valid latitude and longitude'
        }), 400
    
    # Demo mode - return mock forecast data
    if DEMO_MODE:
        base_temp = DEMO_WEATHER_DATA['London']['temperature']
        forecast = generate_demo_forecast('London', base_temp)
        
        if units == 'imperial':
            for day in forecast:
                day['temp_min'] = round(celsius_to_fahrenheit(day['temp_min']))
                day['temp_max'] = round(celsius_to_fahrenheit(day['temp_max']))
                day['temp_avg'] = round(celsius_to_fahrenheit(day['temp_avg']))
        
        return jsonify({
            'city': 'London',
            'country': 'GB',
            'forecast': forecast,
            'units': units
        })
    
    try:
        params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': units
        }
        
        response = requests.get(f'{BASE_URL}/forecast', params=params, timeout=10)
        
        if response.status_code != 200:
            return jsonify({
                'error': 'API Error',
                'message': 'Failed to fetch forecast data'
            }), 500
        
        data = response.json()
        
        # Process forecast data (same logic as get_forecast)
        daily_forecasts = {}
        
        for item in data['list']:
            date_obj = datetime.utcfromtimestamp(item['dt'] + data['city']['timezone'])
            date_key = date_obj.strftime('%Y-%m-%d')
            
            if date_key not in daily_forecasts:
                daily_forecasts[date_key] = {
                    'date': date_obj.strftime('%a, %b %d'),
                    'date_full': date_obj.strftime('%Y-%m-%d'),
                    'temps': [],
                    'weather_icons': [],
                    'weather_descriptions': [],
                    'humidity': [],
                    'wind_speed': [],
                    'timestamps': []
                }
            
            daily_forecasts[date_key]['temps'].append(item['main']['temp'])
            daily_forecasts[date_key]['weather_icons'].append(item['weather'][0]['icon'])
            daily_forecasts[date_key]['weather_descriptions'].append(item['weather'][0]['description'])
            daily_forecasts[date_key]['humidity'].append(item['main']['humidity'])
            daily_forecasts[date_key]['wind_speed'].append(item['wind']['speed'])
            daily_forecasts[date_key]['timestamps'].append(item['dt'])
        
        forecast_list = []
        for date_key, day_data in list(daily_forecasts.items())[:5]:
            icon_counts = {}
            desc_counts = {}
            for icon in day_data['weather_icons']:
                icon_counts[icon] = icon_counts.get(icon, 0) + 1
            for desc in day_data['weather_descriptions']:
                desc_counts[desc] = desc_counts.get(desc, 0) + 1
            
            most_common_icon = max(icon_counts, key=icon_counts.get)
            most_common_desc = max(desc_counts, key=desc_counts.get)
            
            forecast_list.append({
                'date': day_data['date'],
                'date_full': day_data['date_full'],
                'temp_min': round(min(day_data['temps'])),
                'temp_max': round(max(day_data['temps'])),
                'temp_avg': round(sum(day_data['temps']) / len(day_data['temps'])),
                'humidity': round(sum(day_data['humidity']) / len(day_data['humidity'])),
                'wind_speed': round(max(day_data['wind_speed']), 1),
                'weather_icon': most_common_icon,
                'icon_url': get_weather_icon_url(most_common_icon),
                'weather_description': most_common_desc.title(),
                'weather_main': most_common_desc.split()[0].title()
            })
        
        return jsonify({
            'city': data['city']['name'],
            'country': data['city']['country'],
            'forecast': forecast_list,
            'units': units
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': 'Failed to fetch forecast data'
        }), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource was not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred'
    }), 500


if __name__ == '__main__':
    # Run the Flask application
    # Debug mode is enabled for development
    app.run(debug=True, host='0.0.0.0', port=5000)

const cityInput = document.getElementById('city-input');
const countryInput = document.getElementById('country-input');
const searchCityBtn = document.getElementById('search-city-btn');
const searchCountryBtn = document.getElementById('search-country-btn');
const statusMsg = document.getElementById('status-message');
const weatherContent = document.getElementById('weather-content');
const locationName = document.getElementById('location-name');
const countryLabel = document.getElementById('country-label');
const tempValue = document.getElementById('temp-value');
const weatherDesc = document.getElementById('weather-description');
const countryFlag = document.getElementById('country-flag');
const humidityValue = document.getElementById('humidity-value');
const windSpeed = document.getElementById('wind-speed');

// WMO Weather Codes to Human-Readable Descriptions
const weatherCodeMap = {
  0: { label: 'Clear sky', bg: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' },
  1: { label: 'Mainly clear', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  2: { label: 'Partly cloudy', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  3: { label: 'Overcast', bg: 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)' },
  45: { label: 'FogGY', bg: 'linear-gradient(135deg, #3e5151 0%, #decba4 100%)' },
  48: { label: 'Depositing rime fog', bg: 'linear-gradient(135deg, #3e5151 0%, #decba4 100%)' },
  51: { label: 'Light Drizzle', bg: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  53: { label: 'Moderate Drizzle', bg: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  55: { label: 'Dense Drizzle', bg: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  61: { label: 'Slight Rain', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  63: { label: 'Moderate Rain', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  65: { label: 'Heavy Rain', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  71: { label: 'Slight Snow', bg: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)' },
  73: { label: 'Moderate Snow', bg: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)' },
  75: { label: 'Heavy Snow', bg: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)' },
  95: { label: 'Thunderstorm', bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }
};

const defaultBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

async function getWeatherData(city) {
  try {
    statusMsg.innerText = 'Searching for location...';
    weatherContent.style.display = 'none';

    // 1. Geocoding
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      statusMsg.innerText = 'Location not found. Please try again.';
      return;
    }

    const { latitude, longitude, name, country, admin1, country_code } = geoData.results[0];
    
    // 2. Weather Data
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&wind_speed_unit=kmh`);
    const weatherData = await weatherResponse.json();

    updateUI(name, country, admin1, country_code, weatherData);
    
  } catch (error) {
    console.error('Fetch error:', error);
    statusMsg.innerText = 'Something went wrong. Check your connection.';
  }
}

function updateUI(city, country, region, countryCode, data) {
  const current = data.current_weather;
  const weatherCode = current.weathercode;
  const conditions = weatherCodeMap[weatherCode] || { label: 'Unknown', bg: defaultBg };

  // Update Flag
  countryFlag.src = `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;
  countryFlag.style.display = 'block';

  // Update display
  locationName.innerText = city;
  countryLabel.innerText = `${region ? region + ', ' : ''}${country}`;
  tempValue.innerText = Math.round(current.temperature);
  weatherDesc.innerText = conditions.label;
  windSpeed.innerText = `${current.windspeed} km/h`;
  
  // Find current humidity from hourly data (Open-Meteo current_weather doesn't include it by default)
  const now = new Date();
  const currentHour = now.getHours();
  const humidity = data.hourly.relative_humidity_2m[currentHour] || '--';
  humidityValue.innerText = `${humidity}%`;

  // Update backgrounds
  document.body.style.background = conditions.bg;
  
  // Show content
  statusMsg.style.display = 'none';
  weatherContent.style.display = 'block';
}

searchCityBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  const country = countryInput.value.trim();
  if (city) {
    const query = country ? `${city}, ${country}` : city;
    getWeatherData(query);
  }
});

searchCountryBtn.addEventListener('click', () => {
  const country = countryInput.value.trim();
  if (country) {
    getWeatherData(country);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) {
      const country = countryInput.value.trim();
      const query = country ? `${city}, ${country}` : city;
      getWeatherData(query);
    }
  }
});

countryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const country = countryInput.value.trim();
    if (country) {
      getWeatherData(country);
    }
  }
});

// Initial Search (e.g. London)
// (Optional) getWeatherData('London');

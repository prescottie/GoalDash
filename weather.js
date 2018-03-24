const locationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 3600000
};

export function getLocation() {
  chrome.storage.sync.get("weather", (w) => {
    if (w.weather) {
      let weatherTime = new Date(w.weather.time);
      let timeSinceWeather = Date.now() - weatherTime;
      if(timeSinceWeather > 600000) {
        console.log("weather needs updating");
        
        navigator.geolocation.getCurrentPosition(fetchWeather, geoError, locationOptions);
      } else if (timeSinceWeather < 600000) {
        console.log("weather is okay for now I think");
        setWeather(w.weather)
      }
    } else {
      navigator.geolocation.getCurrentPosition(fetchWeather, geoError, locationOptions);
    } 
  });
}

function geoError(error) {
  console.error(error)
}

function fetchWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=5532a9cf8f9fc2b07e8d2b32baf440e4`, {
    method: 'GET'
  }).then(res => res.json())
  .then(w => {
    const weather = {};
    weather.iconId = w.weather[0].icon;
    weather.temp = Math.round(w.main.temp);
    weather.city = w.name;
    weather.description = w.weather[0].description;
    weather.time = Date.now();
    chrome.storage.sync.set({"weather":weather}, () => {
      console.log("weather updated");
    });
    setWeather(weather);
  });
}

function getWeather(position) {
  chrome.storage.sync.get("weather", (w) => {
    if (w.weather) {
      let weatherTime = new Date(w.weather.time);
      let timeSinceWeather = Date.now() - weatherTime;
      if(timeSinceWeather > 600000) {
        fetchWeather(position);
      } else {
        setWeather(w.weather);
      }
    } else {
      fetchWeather(position);
    }
  });
}

async function setWeather(weather) {
  const icon = getWeatherIcon(weather.iconId);
  document.getElementById('weatherCity').innerHTML = weather.city;
  document.getElementById('weatherTemp').innerHTML = weather.temp + "°";
  document.getElementById('weatherDescript').innerHTML = weather.description;
  document.getElementById('weatherIcon').innerHTML = icon;
}

function getWeatherIcon(iconID) {
  if(iconID === '01d') {
    return "☀️";
  } else if (iconID === '01n') {
    return "🌙" ;
  } else if (iconID === '02d') {
    return "⛅";
  } else if (iconID === '02n') {
    return "☁️";
  } else if (iconID === '03d' || iconID === '03n' || iconID === '04d' || iconID === '04n') {
    return "☁️";
  } else if (iconID === '09d' || iconID === '09n' || iconID === '10d' || iconID === '10n') {
    return "🌧";
  } else if (iconID === '11d' || iconID === '11n') {
    return "🌩";
  } else if (iconID === '13d' || iconID === '13n') {
    return "❄️";
  } else {
    return "";
  }
}
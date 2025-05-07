function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    // Show loading indication
    document.getElementById('weatherResult').innerHTML = '<p>Loading weather data...</p>';
    
    fetch(`/weather?city=${city}`)
        .then(response => response.json())
        .then(data => {
            const weatherDiv = document.getElementById('weatherResult');
            if (data.error) {
                weatherDiv.innerHTML = `<p class="error">${data.error}</p>`;
            } else {
                // Current weather
                let html = `
                    <div class="current-weather">
                        <h2>Current Weather in ${data.current.name}</h2>
                        <div class="weather-detail">
                            <span>Temperature:</span>
                            <span>${Math.round(data.current.main.temp)}°C</span>
                        </div>
                        <div class="weather-detail">
                            <span>Weather:</span>
                            <span>${data.current.weather[0].description}</span>
                        </div>
                        <div class="weather-detail">
                            <span>Humidity:</span>
                            <span>${data.current.main.humidity}%</span>
                        </div>
                        <div class="weather-detail">
                            <span>Wind Speed:</span>
                            <span>${data.current.wind.speed} m/s</span>
                        </div>
                    </div>
                    
                    <h3>5-Day Forecast</h3>
                    <div class="forecast-container">
                `;
                
                // Process forecast data
                const forecastByDay = {};
                data.forecast.list.forEach(item => {
                    // Get date without time
                    const date = item.dt_txt.split(' ')[0];
                    if (!forecastByDay[date]) {
                        forecastByDay[date] = item;
                    }
                });
                
                // Add forecast items
                Object.keys(forecastByDay).forEach(date => {
                    const forecast = forecastByDay[date];
                    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    
                    html += `
                        <div class="forecast-item">
                            <p class="forecast-date">${formattedDate}</p>
                            <p>Temp: ${Math.round(forecast.main.temp)}°C</p>
                            <p>${forecast.weather[0].description}</p>
                            <p>Humidity: ${forecast.main.humidity}%</p>
                        </div>
                    `;
                });
                
                html += `</div>`;
                weatherDiv.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherResult').innerHTML = 
                '<p class="error">Error fetching weather data. Please try again.</p>';
        });
}

// Add event listener for the Enter key
document.getElementById('cityInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

async function getWeather() {
    // Ask user for confirmation
    const confirmLocation = confirm("Would you like to share your location to check the weather?");
    if (!confirmLocation) {
      console.log("Location access denied. Cannot fetch weather.");
      return;
    }

    // Get user's location using Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Fetch weather data from OpenWeather API
        const apiKey = 'dd46daea4641be463ad7c5bba30df6a1'; // Replace with your OpenWeather API key
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.cod === 200) {
            weatherText.textContent = `PRAISE THE ${data.weather[0].description.toUpperCase()}`;
            weatherDescription.textContent = `Weather in ${data.name}: ${data.weather[0].description}  Temperature: ${data.main.temp}°C`;
            // Log the weather information to the console
            //console.log(`Weather in ${data.name}:`);
            //console.log(`- Description: ${data.weather[0].description}`);
            //console.log(`- Temperature: ${data.main.temp}°C`);
          } else {
            console.log(`Error: ${data.message}`);
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      }, (error) => {
        console.error("Error getting location:", error);
      });
    } else {
      console.log("Geolocation is not supported by your browser.");
    }
  }
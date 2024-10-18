const apiKey = "2f8c6a3c7071b21d48930d5da0093244";

let isCelsius = true;

document.getElementById("searchButton").addEventListener("click", getWeather);
document
  .getElementById("locationButton")
  .addEventListener("click", getWeatherByLocation);
document
  .getElementById("unitToggle")
  .addEventListener("click", toggleTemperatureUnit);

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    updateWeatherWidget(weatherData);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    updateCharts(forecastData);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Could not fetch weather data. Please try again.");
  }
}

async function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        updateWeatherWidget(weatherData);

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        updateCharts(forecastData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Could not fetch weather data. Please try again.");
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  const temperatureElement = document.getElementById("temperature");
  const currentTemperature = parseFloat(
    temperatureElement.innerText.split(": ")[1]
  );
  let newTemperature;

  if (isCelsius) {
    newTemperature = ((currentTemperature - 32) * 5) / 9;
    temperatureElement.innerText = `Temperature: ${Math.round(
      newTemperature
    )}°C`;
  } else {
    newTemperature = (currentTemperature * 9) / 5 + 32;
    temperatureElement.innerText = `Temperature: ${Math.round(
      newTemperature
    )}°F`;
  }
}

function updateWeatherWidget(data) {
  const cityName = data.name;
  const temperature = Math.round(data.main.temp);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const condition = data.weather[0].description;
  const icon = data.weather[0].icon;

  const backgroundImages = {
    clear: "url('./clear-sky.jpg')",
    clouds: "url('./clouds.jpg')",
    rain: "url('./rain.jpeg')",
    snow: "url('./snow.jpeg')",
    thunderstorm: "url('./thunderstorm.jpg')",
    drizzle: "url('./drizzle.jpeg')",
    mist: "url('./mist.jpg')",
    haze: "url('./haze.jpg')",
    smoke: "url('./smoke.jpeg')",
  };

  const backgroundColors = {
    default: "rgba(160, 206, 235, 0.7)", // Sky blue
    clear: "rgba(160, 206, 235, 0.7)", // Sky blue
    clouds: "rgba(169, 169, 169, 0.7)", // Grey
    rain: "rgba(100, 100, 255, 0.7)",
    snow: "rgba(255, 255, 255, 0.7)",
    thunderstorm: "rgba(150, 150, 255, 0.7)",
    drizzle: "rgba(150, 150, 255, 0.7)",
    mist: "rgba(200, 200, 200, 0.7)",
    haze: "rgba(200, 200, 200, 0.7)",
    smoke: "rgba(200, 200, 200, 0.7)",
  };

  let backgroundImage = backgroundImages.clear; // Default to clear sky
  let backgroundColor = backgroundColors.default;

  if (condition.includes("clear")) {
    backgroundImage = backgroundImages.clear;
    backgroundColor = backgroundColors.clear;
  } else if (condition.includes("cloud")) {
    backgroundImage = backgroundImages.clouds;
    backgroundColor = backgroundColors.clouds;
  } else if (condition.includes("rain")) {
    backgroundImage = backgroundImages.rain;
    backgroundColor = backgroundColors.rain;
  } else if (condition.includes("snow")) {
    backgroundImage = backgroundImages.snow;
    backgroundColor = backgroundColors.snow;
  } else if (condition.includes("thunderstorm")) {
    backgroundImage = backgroundImages.thunderstorm;
    backgroundColor = backgroundColors.thunderstorm;
  } else if (condition.includes("drizzle")) {
    backgroundImage = backgroundImages.drizzle;
    backgroundColor = backgroundColors.drizzle;
  } else if (condition.includes("mist")) {
    backgroundImage = backgroundImages.mist;
    backgroundColor = backgroundColors.mist;
  } else if (condition.includes("haze")) {
    backgroundImage = backgroundImages.haze;
    backgroundColor = backgroundColors.haze;
  } else if (condition.includes("smoke")) {
    backgroundImage = backgroundImages.smoke;
    backgroundColor = backgroundColors.smoke;
  }

  document.body.style.backgroundImage = backgroundImage;
  document.getElementById("weatherWidget").style.backgroundColor =
    backgroundColor;

  document.getElementById("cityName").innerText = cityName;
  document.getElementById(
    "temperature"
  ).innerText = `Temperature: ${temperature}°C`;
  document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
  document.getElementById(
    "windSpeed"
  ).innerText = `Wind Speed: ${windSpeed} m/s`;
  document.getElementById("condition").innerText = `Condition: ${condition}`;
  document.getElementById(
    "weatherIcon"
  ).src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  document.getElementById("weatherIcon").style.display = "block";
  document.getElementById("weatherIcon").style.margin = "0 auto";

  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.style.backgroundColor = backgroundColor;
  });

  document.getElementById("cityName").innerText = cityName;
  document.getElementById(
    "temperature"
  ).innerText = `Temperature: ${temperature}°C`;
  document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
  document.getElementById(
    "windSpeed"
  ).innerText = `Wind Speed: ${windSpeed} m/s`;
  document.getElementById("condition").innerText = `Condition: ${condition}`;
  document.getElementById(
    "weatherIcon"
  ).src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  document.getElementById("weatherIcon").style.display = "block";
  document.getElementById("weatherIcon").style.margin = "0 auto";
}

let barChart, doughnutChart, lineChart;

function updateCharts(forecastData) {
  const labels = [];
  const temperatures = [];
  const conditions = {};
  const tempChanges = [];

  forecastData.list.forEach((item, index) => {
    if (index % 8 === 0) {
      labels.push(item.dt_txt.split(" ")[0]);
      temperatures.push(item.main.temp);
      const condition = item.weather[0].main;
      conditions[condition] = (conditions[condition] || 0) + 1;
      tempChanges.push(item.main.temp);
    }
  });

  const highContrastColors = [
    "rgba(255, 99, 132, 0.8)", // Red
    "rgba(54, 162, 235, 0.8)", // Blue
    "rgba(255, 206, 86, 0.8)", // Yellow
    "rgba(75, 192, 192, 0.8)", // Green
    "rgba(153, 102, 255, 0.8)", // Purple
    "rgba(255, 159, 64, 0.8)", // Orange
  ];

  if (barChart) {
    barChart.destroy();
  }
  const ctxBar = document.getElementById("barChart").getContext("2d");
  barChart = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          backgroundColor: highContrastColors,
          borderColor: highContrastColors.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        delay: 500, // Delay animation
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(0, 0, 0, 0.8)", // High contrast color for x-axis
          },
        },
        y: {
          ticks: {
            color: "rgba(0, 0, 0, 0.8)", // High contrast color for y-axis
          },
        },
      },
    },
  });

  if (doughnutChart) {
    doughnutChart.destroy();
  }
  const conditionLabels = Object.keys(conditions);
  const conditionValues = Object.values(conditions);
  const ctxDoughnut = document.getElementById("doughnutChart").getContext("2d");
  doughnutChart = new Chart(ctxDoughnut, {
    type: "doughnut",
    data: {
      labels: conditionLabels,
      datasets: [
        {
          label: "Weather Conditions",
          data: conditionValues,
          backgroundColor: highContrastColors,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        delay: 500, // Delay animation
      },
    },
  });

  if (lineChart) {
    lineChart.destroy();
  }
  const ctxLine = document.getElementById("lineChart").getContext("2d");
  lineChart = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature Change (°C)",
          data: tempChanges,
          fill: false,
          borderColor: highContrastColors[0],
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        onComplete: () => {
          // Drop animation
          ctxLine.canvas.style.transform = "translateY(0)";
        },
        onProgress: (animation) => {
          const progress = animation.currentStep / animation.numSteps;
          ctxLine.canvas.style.transform = `translateY(${
            (1 - progress) * 20
          }px)`;
        },
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(0, 0, 0, 0.8)", // High contrast color for x-axis
          },
        },
        y: {
          ticks: {
            color: "rgba(0, 0, 0, 0.8)", // High contrast color for y-axis
          },
        },
      },
    },
  });
}

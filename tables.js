const apiKey = "2f8c6a3c7071b21d48930d5da0093244";
const baseUrl = "https://api.openweathermap.org/data/2.5/forecast";

// Gemini API Key and URL
const geminiApiKey = "AIzaSyBMm7K863gkr1MW3cISkQDnQV7wAPSOtig";

let allForecasts = [];
let isCelsius = true;

document.querySelector(".search-button").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const weatherData = await fetchWeatherData(city);
  if (weatherData) {
    displayWeatherData(weatherData);
    updateBackground(weatherData.list[0].weather[0].main);
  }
});

document.getElementById("locationButton").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherDataByLocation(
          latitude,
          longitude
        );
        if (weatherData) {
          displayWeatherData(weatherData);
          updateBackground(weatherData.list[0].weather[0].main);
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please try again.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `${baseUrl}?q=${city}&units=metric&cnt=40&appid=${apiKey}`
    );
    const data = await response.json();
    if (data.cod === "200") {
      allForecasts = data.list;
      return data;
    } else {
      alert(`Error: ${data.message}`);
      return null;
    }
  } catch (error) {
    alert("Failed to fetch weather data. Please try again later.");
    console.error(error);
    return null;
  }
}

async function fetchWeatherDataByLocation(lat, lon) {
  try {
    const response = await fetch(
      `${baseUrl}?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${apiKey}`
    );
    const data = await response.json();
    if (data.cod === "200") {
      allForecasts = data.list;
      return data;
    } else {
      alert(`Error: ${data.message}`);
      return null;
    }
  } catch (error) {
    alert("Failed to fetch weather data. Please try again later.");
    console.error(error);
    return null;
  }
}

document.getElementById("unitToggle").addEventListener("click", () => {
  isCelsius = !isCelsius;
  displayWeatherData({ list: allForecasts });
});

function convertTemperature(temp) {
  return isCelsius ? temp : (temp * 9) / 5 + 32;
}

function displayWeatherData(data) {
  const weatherTableBody = document.getElementById("weatherTableBody");
  weatherTableBody.innerHTML = "";

  const forecasts = data.list;

  forecasts.forEach((forecast) => {
    const day = new Date(forecast.dt_txt).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const date = forecast.dt_txt.split(" ")[0];
    const maxTemp = Math.round(convertTemperature(forecast.main.temp_max));
    const minTemp = Math.round(convertTemperature(forecast.main.temp_min));
    const condition = forecast.weather[0].description;

    const row = `
      <tr>
        <td class="border-b p-4">${day}</td>
        <td class="border-b p-4">${date}</td>
        <td class="border-b p-4">${maxTemp}°${isCelsius ? "C" : "F"}</td>
        <td class="border-b p-4">${minTemp}°${isCelsius ? "C" : "F"}</td>
        <td class="border-b p-4">${condition}</td>
      </tr>
    `;

    weatherTableBody.insertAdjacentHTML("beforeend", row);
  });

  setupPagination(forecasts);
}

function setupPagination(data) {
  const totalPages = Math.ceil(data.length / 10);
  let currentPage = 1;

  const pageInfo = document.getElementById("pageInfo");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");

  function updatePageInfo() {
    pageInfo.textContent = `${currentPage} out of ${totalPages}`;
  }

  updatePageInfo();

  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayPage(currentPage, data);
      updatePageInfo();
    }
  });

  nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage, data);
      updatePageInfo();
    }
  });

  displayPage(currentPage, data);
}

function displayPage(pageNumber, data) {
  const startIndex = (pageNumber - 1) * 10;
  const endIndex = startIndex + 10;
  const pageData = data.slice(startIndex, endIndex);

  const weatherTableBody = document.getElementById("weatherTableBody");
  weatherTableBody.innerHTML = "";

  pageData.forEach((forecast) => {
    const day = new Date(forecast.dt_txt).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const date = forecast.dt_txt.split(" ")[0];
    const maxTemp = Math.round(convertTemperature(forecast.main.temp_max));
    const minTemp = Math.round(convertTemperature(forecast.main.temp_min));
    const condition = forecast.weather[0].description;

    const row = `
    <tr>
      <td class="border-b p-4 table-cell">${day}</td>
      <td class="border-b p-4 table-cell">${date}</td>
      <td class="border-b p-4 table-cell">${maxTemp}°${
      isCelsius ? "C" : "F"
    }</td>
      <td class="border-b p-4 table-cell">${minTemp}°${
      isCelsius ? "C" : "F"
    }</td>
      <td class="border-b p-4 table-cell">${condition}</td>
    </tr>
  `;

    weatherTableBody.insertAdjacentHTML("beforeend", row);
  });
}

function sortTemperaturesAscending() {
  const sortedForecasts = [...allForecasts].sort(
    (a, b) => a.main.temp_min - b.main.temp_min
  );
  displayWeatherData({ list: sortedForecasts });
}

function sortTemperaturesDescending() {
  const sortedForecasts = [...allForecasts].sort(
    (a, b) => b.main.temp_max - a.main.temp_max
  );
  displayWeatherData({ list: sortedForecasts });
}

function filterRainyDays() {
  const rainyDays = allForecasts.filter((forecast) =>
    forecast.weather.some((condition) => condition.description.includes("rain"))
  );
  displayWeatherData({ list: rainyDays });
}

function findDayWithHighestTemperature() {
  const highestTempDay = allForecasts.reduce((max, forecast) => {
    return forecast.main.temp_max > max.main.temp_max ? forecast : max;
  }, allForecasts[0]);

  displayWeatherData({ list: [highestTempDay] });
}

function appendToChat(userQuery, botResponse) {
  const chatbotResponse = document.getElementById("chatbotResponse");

  const userQueryElement = document.createElement("div");
  userQueryElement.style.backgroundColor = "grey";
  userQueryElement.style.color = "white";
  userQueryElement.style.padding = "10px";
  userQueryElement.style.marginBottom = "5px";
  userQueryElement.textContent = userQuery;

  const botResponseElement = document.createElement("div");
  botResponseElement.style.backgroundColor = "white";
  botResponseElement.style.color = "black";
  botResponseElement.style.padding = "10px";
  botResponseElement.style.marginBottom = "10px";
  botResponseElement.textContent = botResponse;

  chatbotResponse.appendChild(userQueryElement);
  chatbotResponse.appendChild(botResponseElement);
}

document.querySelector(".send").addEventListener("click", async () => {
  const chatbotInput = document
    .getElementById("chatbotInput")
    .value.toLowerCase();
  if (!chatbotInput) return;

  if (chatbotInput.includes("weather")) {
    handleWeatherQuery(chatbotInput, appendToChat);
  } else {
    const response = await fetchGeminiResponse(chatbotInput);
    appendToChat(chatbotInput, response);
  }
});

function handleWeatherQuery(chatbotInput, appendToChat) {
  let response =
    "I can help with weather-related queries. Try asking about specific days, temperatures, or conditions.";

  if (chatbotInput.includes("highest")) {
    handleHighestTemperature((response) =>
      appendToChat(chatbotInput, response)
    );
  } else if (
    chatbotInput.includes("lowest") ||
    chatbotInput.includes("minimum")
  ) {
    handleLowestTemperature((response) => appendToChat(chatbotInput, response));
  } else if (chatbotInput.includes("average")) {
    handleAverageTemperature((response) =>
      appendToChat(chatbotInput, response)
    );
  } else if (chatbotInput.includes("rain")) {
    handleRainyDays((response) => appendToChat(chatbotInput, response));
  } else {
    handleSpecificDayOrDateQuery(chatbotInput, appendToChat);
  }
}

function handleHighestTemperature(callback) {
  const highestTemp = allForecasts.reduce((max, forecast) => {
    return forecast.main.temp_max > max.main.temp_max ? forecast : max;
  }, allForecasts[0]);

  const response = `The highest temperature is expected to be ${Math.round(
    highestTemp.main.temp_max
  )}°${isCelsius ? "C" : "F"} on ${new Date(
    highestTemp.dt_txt
  ).toLocaleDateString("en-US", { weekday: "long" })}.`;
  callback(response);
}

function handleLowestTemperature(callback) {
  const lowestTemp = allForecasts.reduce((min, forecast) => {
    return forecast.main.temp_min < min.main.temp_min ? forecast : min;
  }, allForecasts[0]);

  const response = `The lowest temperature is expected to be ${Math.round(
    lowestTemp.main.temp_max
  )}°${isCelsius ? "C" : "F"} on ${new Date(
    lowestTemp.dt_txt
  ).toLocaleDateString("en-US", { weekday: "long" })}.`;
  callback(response);
}

function handleAverageTemperature(callback) {
  const totalTemp = allForecasts.reduce(
    (total, forecast) => total + forecast.main.temp,
    0
  );
  const averageTemp = totalTemp / allForecasts.length;

  const response = `The average temperature is expected to be ${Math.round(
    averageTemp
  )}°${isCelsius ? "C" : "F"}.`;
  callback(response);
}

function handleRainyDays(callback) {
  const rainyDays = allForecasts.filter((forecast) =>
    forecast.weather.some((condition) => condition.description.includes("rain"))
  );

  const response =
    rainyDays.length > 0
      ? `There are ${rainyDays.length} rainy days expected.`
      : "No rainy days are expected.";
  callback(response);
}

function handleSpecificDayOrDateQuery(chatbotInput, appendToChat) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/;

  let matchedDay = daysOfWeek.find((day) => chatbotInput.includes(day));
  let matchedDate = chatbotInput.match(dateRegex);

  if (matchedDay) {
    handleWeatherForDay(matchedDay, (response) =>
      appendToChat(chatbotInput, response)
    );
  } else if (matchedDate) {
    handleWeatherForDate(matchedDate[0], (response) =>
      appendToChat(chatbotInput, response)
    );
  } else {
    appendToChat(
      chatbotInput,
      "I couldn't find a specific day or date in your query."
    );
  }
}

function handleWeatherForDay(day, callback) {
  const forecastForDay = allForecasts.find((forecast) => {
    const forecastDay = new Date(forecast.dt_txt)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    return forecastDay === day;
  });

  if (forecastForDay) {
    const condition = forecastForDay.weather[0].description;
    callback(
      `The weather on ${
        day.charAt(0).toUpperCase() + day.slice(1)
      } is expected to be ${condition}.`
    );
  } else {
    callback(`No weather data available for ${day}.`);
  }
}

function handleWeatherForDate(date, callback) {
  const forecastForDate = allForecasts.find((forecast) =>
    forecast.dt_txt.startsWith(date)
  );

  if (forecastForDate) {
    const condition = forecastForDate.weather[0].description;
    callback(`The weather on ${date} is expected to be ${condition}.`);
  } else {
    callback(`No weather data available for ${date}.`);
  }
}

async function fetchGeminiResponse(chatbotInput) {
  const requestBody = {
    model: "text-davinci-003",
    prompt: chatbotInput,
    max_tokens: 100,
    temperature: 0.7,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${geminiApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chatbot response.");
    }

    const data = await response.json();
    return data.choices && data.choices.length > 0
      ? data.choices[0].text.trim()
      : "Please ask weather related query. I won't be able to answer non weather queries.";
  } catch (error) {
    console.error(error);
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

function updateBackground(weatherCondition) {
  const body = document.body;
  const forecastContainer = document.querySelector(".forecast-container");
  const chatbotContainer = document.querySelector(".chatbot-container");

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      body.style.backgroundImage = "url('./clear-sky.jpg')";
      forecastContainer.style.backgroundColor = "rgba(135, 206, 235, 0.7)";
      chatbotContainer.style.backgroundColor = "rgba(135, 206, 235, 0.7)";
      break;
    case "clouds":
      body.style.backgroundImage = "url('./clouds.jpg')";
      forecastContainer.style.backgroundColor = "rgba(169, 169, 169, 0.7)";
      chatbotContainer.style.backgroundColor = "rgba(169, 169, 169, 0.7)";
      break;
    case "rain":
      body.style.backgroundImage = "url('./rain.jpeg')";
      forecastContainer.style.backgroundColor = "rgba(100, 100, 255, 0.7)";
      chatbotContainer.style.backgroundColor = "rgba(100, 100, 255, 0.7)";
      break;
    case "snow":
      body.style.backgroundImage = "url('./snow.jpeg')";
      forecastContainer.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
      chatbotContainer.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
      break;
    default:
      body.style.backgroundImage = "url('./default.jpg')";
      forecastContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      chatbotContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      break;
  }
}

import './styles/jass.css';

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

// Example fetch request in main.ts
async function fetchWeather(city: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ city }), // Only send the city name
    });

    const weatherData = await response.json();
    console.log('weatherData: ', weatherData);

    if (!response.ok) {
      throw new Error(weatherData.error || 'Failed to fetch weather data');
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

const fetchSearchHistory = async () => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return history;
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { temperature, description, city, country, icon } = currentWeather;

  // Update the DOM elements with current weather data
  heading.textContent = `${city}, ${country}`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/wn/${icon}.png`
  );
  weatherIcon.setAttribute('alt', description);
  tempEl.textContent = `Temp: ${temperature}°C`;
  windEl.textContent = `Wind: N/A`; // Replace with actual wind speed if available
  humidityEl.textContent = `Humidity: N/A`; // Replace with actual humidity if available

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

// Call renderForecast function to utilize it
const renderForecast = (forecast: any[]): void => {
  forecastContainer.innerHTML = ''; // Clear previous forecast data

  // Add a heading for the forecast section
  const headingCol = document.createElement('div');
  const forecastHeading = document.createElement('h4');
  headingCol.setAttribute('class', 'col-12');
  forecastHeading.textContent = '5-Day Forecast:';
  headingCol.append(forecastHeading);
  forecastContainer.append(headingCol);

  // Loop through the forecast array and render each forecast card
  forecast.forEach((day) => {
    renderForecastCard(day);
  });
};

fetchWeather('exampleCity').then((weatherData) => {
  renderForecast(weatherData.forecast); // Example usage

  const forecast = weatherData.forecast; // Define forecast from weatherData
  const headingCol = document.createElement('div');
  const forecastHeading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  forecastHeading.textContent = '5-Day Forecast:';
  headingCol.append(forecastHeading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
});

const renderForecastCard = (forecast: any): void => {
  const { temperature, description, icon } = forecast;

  // Create a forecast card
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const descEl = document.createElement('p');

  // Add content to elements
  cardTitle.textContent = description; // Use description as the title
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/wn/${icon}.png`
  );
  weatherIcon.setAttribute('alt', description);
  tempEl.textContent = `Temp: ${temperature}°C`;
  descEl.textContent = description;

  // Append elements to the card
  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, descEl);

  // Add classes for styling
  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  descEl.classList.add('card-text');

  // Append the card to the forecast container
  forecastContainer.append(col);
};

const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory.json();

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem);
    }
  }
};

// Function to display weatherData on the page
const renderWeatherDataDebug = (weatherData: any): void => {
  const debugContainer = document.getElementById('debug-container') as HTMLElement;

  if (debugContainer) {
    debugContainer.innerHTML = ''; // Clear previous content
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(weatherData, null, 2); // Format the weatherData as JSON
    debugContainer.appendChild(pre);
  }
};

/*

Helper Functions

*/



const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  if (!searchInput.value) {
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search).then((weatherData) => {
    renderCurrentWeather(weatherData.current); // Render current weather
    renderForecast(weatherData.forecast); // Render forecast
    renderWeatherDataDebug(weatherData); // Render weatherData for debugging
    getAndRenderHistory(); // Update search history
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    const city = event.target.textContent;
    fetchWeather(city).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute('data-city')).id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();

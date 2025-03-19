import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public temperature: number,
    public description: string,
    public city: string,
    public country: string,
    public icon: string
  ) {}
}

class WeatherService {
  private baseURL = 'https://api.openweathermap.org';
  private apiKey = process.env.API_KEY || '';
  public cityName: string = '';

  // Fetch location data based on city name
  private async fetchLocationData(query: string): Promise<any> {
    console.log('Using API Key:', this.apiKey); // Debugging: Check if the API key is being used

    const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    console.log('Request URL:', url); // Debugging: Check the full request URL

    const response = await axios.get(url);
    return response.data[0];
  }

  // Extract latitude and longitude from location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Fetch weather data based on coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
  }

  // Parse the current weather data into a Weather object
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      response.list[0].main.temp,
      response.list[0].weather[0].description,
      response.city.name,
      response.city.country,
      response.list[0].weather[0].icon
    );
  }

  // Parse the 5-day forecast data
  private parseForecast(response: any): Weather[] {
    return response.list
      .filter((_: any, index: number) => index % 8 === 0) // Get one forecast per day
      .map((forecast: any) => {
        return new Weather(
          forecast.main.temp,
          forecast.weather[0].description,
          response.city.name,
          response.city.country,
          forecast.weather[0].icon
        );
      });
  }

  // Get weather data for a specific city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    this.cityName = city;
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.parseForecast(weatherData);

    return { current: currentWeather, forecast };
  }
}

export default new WeatherService();

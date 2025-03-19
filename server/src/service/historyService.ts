import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HistoryService {
  private filePath = path.join(__dirname, '../../data/searchHistory.json');

  // Read method that reads from the searchHistory.json file
  private async read(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // If file doesn't exist, return an empty array
        return [];
      }
      throw error;
    }
  }

  // Write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: any[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8');
  }

  // Get all cities from the search history
  async getCities(): Promise<any[]> {
    return await this.read();
  }

  // Add a city to the search history
  async addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    const id = Date.now().toString(); // Generate a unique ID based on the current timestamp
    const newCity = { id, name: cityName };
    cities.push(newCity);
    await this.write(cities);
  }

  // Remove a city from the search history by ID
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
  }
}

const historyService = new HistoryService();
export default historyService;

// Test the HistoryService
async function testHistoryService() {
  try {
    console.log('Adding "San Diego" to search history...');
    await historyService.addCity('San Diego');
    console.log('Current search history:', await historyService.getCities());

    const cities = await historyService.getCities();
    if (cities.length > 0) {
      const cityId = cities[0].id; // Get the ID of the first city
      console.log(`Removing city with ID: ${cityId}`);
      await historyService.removeCity(cityId);
    }
    console.log('Search history after removal:', await historyService.getCities());
    console.log('Search history after removal:', await historyService.getCities());
  } catch (error) {
    console.error('Error testing HistoryService:', error);
  }
}

// Uncomment the following line to test the service
testHistoryService();

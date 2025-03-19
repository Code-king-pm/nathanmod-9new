import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

console.log('Loaded API Key:', process.env.API_KEY); // Debugging: Check if the API key is loaded

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import routes from './routes/api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect API routes
app.use('/api', routes);

// Serve static files
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

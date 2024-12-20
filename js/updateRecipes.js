const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] // Allow requests from these origins
}));

// Serve static files from the project directory
app.use(express.static(path.join(__dirname, '..')));

const filePath = path.join(__dirname, '..', 'data', 'recipes.csv');

app.post('/update-recipes', (req, res) => {
  const { data } = req.body;
  const cleanedData = data.split('\n').filter(line => line.trim() !== '').join('\n'); // Remove empty lines
  fs.writeFile(filePath, cleanedData, 'utf8', (err) => {
    if (err) {
      console.error('Failed to update recipes:', err);
      res.status(500).send('Failed to update recipes');
    } else {
      res.send('Recipes updated successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

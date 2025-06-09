import app from './app.js';

// Set the port
const port = process.env.PORT || 3030;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 
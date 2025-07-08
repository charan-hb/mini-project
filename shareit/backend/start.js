// Set environment variables
process.env.MONGODB_URI = 'mongodb+srv://kishoremp515:BOMUs3wYA4zaiLOl@cluster0.unpihc5.mongodb.net/shareit?retryWrites=true&w=majority&appName=Cluster0';
process.env.JWT_SECRET = 'your_jwt_secret_key_here';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '5000';
process.env.CLIENT_URL = 'http://localhost:3000';

// Start the server
try {
  require('./server.js');
} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
} 
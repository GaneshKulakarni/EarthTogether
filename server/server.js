const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());

// Enable CORS for development
app.use((req, res, next) => {
  // Log incoming request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.headers.origin || 'unknown origin'}`);
  
  // Allow all origins in development
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4501',
    'http://localhost:6102'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Allowed headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token',
    'cache-control',
    'pragma'
  ].join(', '));
  
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Preflight response
    console.log('Handling preflight request');
    return res.status(200).end();
  }
  
  next();
});
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with enhanced options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earthtogether', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/news', require('./routes/news'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/memes', require('./routes/memes'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files
const staticConfig = {
  setHeaders: (res, path) => {
    // Set proper MIME type for common file types
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.ico')) {
      res.set('Content-Type', 'image/x-icon');
    }
  }
};

// In development, serve static files from the React dev server
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode: Using React dev server for static assets');
} 
// In production, serve static files from the build directory
else {
  console.log('Production mode: Serving static files from client/build');
  app.use(express.static(path.join(__dirname, '..', 'client', 'build'), staticConfig));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 4501;
// Bind explicitly to 0.0.0.0 to avoid IPv6/IPv4 ambiguity on some Windows setups
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`🔉 Listening on 0.0.0.0:${PORT} (IPv4)`);
});

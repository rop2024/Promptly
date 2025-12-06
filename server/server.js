import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import apiRoutes from './routes/api.js';
import entryRoutes from './routes/entries.js';
import promptRoutes from './routes/prompts.js';
import streakRoutes from './routes/streak.js';
import analyticsRoutes from './routes/analytics.js';

// Load env vars
dotenv.config();

// Helpful startup logs so it's obvious which client origin the server will allow
console.log('Server starting with:');
console.log(`  NODE_ENV=${process.env.NODE_ENV}`);
console.log(`  PORT=${process.env.PORT}`);
console.log(`  CLIENT_URL=${process.env.CLIENT_URL}`);

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/analytics', analyticsRoutes);
// Mount public API routes last so they don't override specific routes
app.use('/api', apiRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Bind to 0.0.0.0 for Render.com deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
});

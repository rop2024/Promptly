import cors from 'cors';

// Allow the client URL from env plus localhost for development
// Also allow Vercel preview deployments
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174', // Vite dev server sometimes uses 5174
  'http://localhost:5000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Allow exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (format: https://projectname-*.vercel.app)
    if (origin && origin.match(/https:\/\/promptly-[a-z0-9-]+\.vercel\.app$/)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);

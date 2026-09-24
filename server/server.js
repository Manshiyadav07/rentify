const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Headers & CORS
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading public image assets
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all standard API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Rentify API',
    status: 'online',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Platform API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Backward Compatibility Routes (Preserving existing listings & student exchange requests)
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

// 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Rentify Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
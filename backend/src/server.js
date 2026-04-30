require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// ── Middleware ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// ── Serve Frontend in Production ──
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  console.log(`[SERVER] Resolved frontend path: ${frontendDistPath}`);
  
  if (fs.existsSync(frontendDistPath)) {
    console.log('[SERVER] Frontend build found! Serving static files.');
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.error('[SERVER] ERROR: Frontend build directory not found! Check your build command.');
    app.get('*', (req, res) => {
      res.status(500).send('Frontend build not found. The application failed to build correctly.');
    });
  }
} else {
  // ── 404 Handler (API only in dev) ──
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (use migrations in production)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${server.address().port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Error handling for port conflicts (EADDRINUSE)
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;

      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        
        // In local dev, fallback to a dynamic port
        if (process.env.NODE_ENV !== 'production') {
          console.log(`⚠️ Trying random dynamic port as fallback...`);
          const fallbackServer = app.listen(0, () => {
            console.log(`🚀 Server started on fallback port ${fallbackServer.address().port}`);
          });
        } else {
          // In production (Railway/Render), we MUST bind to the provided port
          console.error(`❌ Cannot start. Production environment requires binding to assigned PORT. Exiting.`);
          process.exit(1);
        }
      } else {
        console.error('❌ Server startup error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');

const raRoutes = require('./routes/ra');
const obrasRoutes = require('./routes/obras');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/ra', raRoutes);
app.use('/api/obras', obrasRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'API de Regiões Administrativas do DF está funcionando'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo deu errado!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        available_endpoints: [
            'GET /api/health',
            'GET /api/ra/:latitude/:longitude',
            'GET /api/ra',
            'GET /api/obras',
            'GET /api/obras/with-ra'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API servidor rodando em http://localhost:${PORT}`);
    console.log(`📍 Endpoint RA: http://localhost:${PORT}/api/ra/{lat}/{lng}`);
    console.log(`🏗️  Endpoint Obras: http://localhost:${PORT}/api/obras`);
    console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
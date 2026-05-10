const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const userRoutes = require('./routes/users');
const stationRoutes = require('./routes/stations');
const umbrellaRoutes = require('./routes/umbrellas');
const orderRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');

app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/umbrellas', umbrellaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.json({ message: '共享雨伞API服务' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import customerRoutes from './routes/customerRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



app.get('/', (req, res) => {
  res.json("This is great");
});

app.use('/customers', customerRoutes);
app.use('/interactions', interactionRoutes);
app.use('/deals', dealRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/files', fileRoutes);






export default app;
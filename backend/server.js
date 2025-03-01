require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const QRCode = require('qrcode');

// Kết nối Database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

// Import Model
const Link = require('./models/link')(sequelize, DataTypes);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Tạo link ngắn
app.post('/shorten', async (req, res) => {
  const { original_url } = req.body;
  const short_url = Math.random().toString(36).substr(2, 6); // Tạo mã ngẫu nhiên

  const link = await Link.create({ original_url, short_url });

  // Tạo QR code
  const qr = await QRCode.toDataURL(`http://localhost:3000/${short_url}`);

  res.json({ short_url, qr });
});

// Chuyển hướng khi truy cập link ngắn
app.get('/:short_url', async (req, res) => {
  const link = await Link.findOne({ where: { short_url: req.params.short_url } });

  if (!link) return res.status(404).send('Link not found');

  link.clicks++;
  await link.save();

  res.redirect(link.original_url);
});

// Lấy số lượt click
app.get('/stats/:short_url', async (req, res) => {
  const link = await Link.findOne({ where: { short_url: req.params.short_url } });

  if (!link) return res.status(404).send('Link not found');

  res.json({ clicks: link.clicks });
});

// Chạy server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Welcome to the URL Shortener API!");
});


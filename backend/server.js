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

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Cấu hình Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL Shortener API",
      version: "1.0.0",
      description: "API documentation for the URL Shortener service",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  apis: ["./server.js"], // Nơi định nghĩa API (hoặc dùng "./routes/*.js" nếu tách route)
};

// Tạo docs Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log("Swagger running at http://localhost:4000/api-docs");

/**
 * @swagger
 * /shorten:
 *   post:
 *     summary: Rút gọn URL
 *     description: Nhận URL dài và trả về URL ngắn.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               original_url:
 *                 type: string
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: Trả về link rút gọn.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 short_url:
 *                   type: string
 *                   example: "abc123"
 *       400:
 *         description: Yêu cầu không hợp lệ.
 */
app.post("/shorten", async (req, res) => {
  const { original_url } = req.body;
  if (!original_url) return res.status(400).json({ error: "Missing URL" });

  const shortUrl = Math.random().toString(36).substr(2, 6);
  res.json({ short_url: shortUrl });
});

/**
 * @swagger
 * /stats/{short_url}:
 *   get:
 *     summary: Lấy số lượt click
 *     description: Trả về số lượt truy cập của link rút gọn.
 *     parameters:
 *       - name: short_url
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Trả về số lượt click.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clicks:
 *                   type: integer
 *                   example: 15
 *       404:
 *         description: Link không tồn tại.
 */
app.get("/stats/:short_url", async (req, res) => {
  res.json({ clicks: Math.floor(Math.random() * 100) });
});


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

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const QRCode = require('qrcode');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Lấy PUBLIC_BASE_URL từ biến môi trường
// Khi phát triển cục bộ, nó sẽ là http://localhost:3000
// Khi triển khai trên server, nó sẽ là http://103.170.123.71 (sẽ cấu hình trong .env trên server)
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

// 🔹 Kết nối Database PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

// 🔹 Định nghĩa Model `short_links`
const Link = sequelize.define('short_links', {
  original_url: { type: DataTypes.STRING, allowNull: false },
  short_url: { type: DataTypes.STRING, unique: true, allowNull: false },
  click_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: false });

// 🔹 Định nghĩa Model `transactions`
const Transaction = sequelize.define('transactions', {
  short_url: { type: DataTypes.STRING, allowNull: false },
  clicked_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  user_agent: { type: DataTypes.STRING }
}, { timestamps: false });

// 🔹 Đồng bộ Database
sequelize.sync().then(() => console.log('✅ Database synced!'));

// 🔹 Cấu hình Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL Shortener API",
      version: "1.0.0",
      description: "API documentation for the URL Shortener service",
    },
    servers: [{ url: `${PUBLIC_BASE_URL}/api` }], // Đã sửa để dùng PUBLIC_BASE_URL
  },
  apis: ["./server.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log(`📌 Swagger running at ${PUBLIC_BASE_URL}/api/api-docs`); // Đã sửa để dùng PUBLIC_BASE_URL

/**
 * @swagger
 * /shorten:
 * post:
 * summary: Rút gọn URL
 * description: Nhận URL dài và trả về URL ngắn cùng với mã QR.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * original_url:
 * type: string
 * example: "https://example.com"
 * responses:
 * 200:
 * description: Trả về link rút gọn và QR code.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * short_url:
 * type: string
 * example: "abc123"
 * qr:
 * type: string
 * example: "data:image/png;base64,..."
 */
app.post('/shorten', async (req, res) => {
  try {
    let { original_url } = req.body;

    // Kiểm tra nếu thiếu http:// hoặc https:// thì tự động thêm https://
    if (!/^https?:\/\//i.test(original_url)) {
      original_url = "https://" + original_url;
    }

    if (!original_url) return res.status(400).json({ error: "Missing URL" });

    let link = await Link.findOne({ where: { original_url } });

    if (!link) {
      let short_url;
      do {
        short_url = Math.random().toString(36).substr(2, 6);
      } while (await Link.findOne({ where: { short_url } }));

      link = await Link.create({ original_url, short_url });
    }

    const qr = await QRCode.toDataURL(`${PUBLIC_BASE_URL}/${link.short_url}`); // Đã sửa để dùng PUBLIC_BASE_URL
    res.json({ short_url: link.short_url, qr });

  } catch (error) {
    console.error("❌ Error in /shorten:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @swagger
 * /{short_url}:
 * get:
 * summary: Chuyển hướng đến link gốc
 * description: Khi truy cập link rút gọn, người dùng sẽ được chuyển hướng đến link gốc.
 * parameters:
 * - name: short_url
 * in: path
 * required: true
 * schema:
 * type: string
 * example: "abc123"
 * responses:
 * 302:
 * description: Chuyển hướng đến link gốc.
 * 404:
 * description: Link không tồn tại.
 */
app.get('/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params;

    const link = await Link.findOne({ where: { short_url } });

    if (!link) return res.status(404).send('Link not found');

    await link.increment('click_count');
    await Transaction.create({ short_url, user_agent: req.headers['user-agent'] });

    res.redirect(link.original_url);

  } catch (error) {
    console.error("🚨 Error in redirect:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /stats/{short_url}:
 * get:
 * summary: Lấy số lượt click
 * description: Trả về số lượt truy cập của link rút gọn.
 * parameters:
 * - name: short_url
 * in: path
 * required: true
 * schema:
 * type: string
 * example: "abc123"
 * responses:
 * 200:
 * description: Trả về số lượt click.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * clicks:
 * type: integer
 * example: 15
 * 404:
 * description: Link không tồn tại.
 */
app.get('/stats/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params;
    const link = await Link.findOne({ where: { short_url } });

    if (!link) return res.status(404).json({ error: "Link not found" });

    res.json({ clicks: link.click_count });

  } catch (error) {
    console.error("❌ Error in /stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /:
 * get:
 * summary: Trang chính của API
 * description: Trả về lời chào từ API rút gọn URL.
 * responses:
 * 200:
 * description: Trả về nội dung trang chính.
 * content:
 * text/html:
 * schema:
 * type: string
 * example: "Welcome to the URL Shortener API!"
 */
app.get("/", (req, res) => {
  res.send("Welcome to the URL Shortener API!");
});

// 🔹 Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
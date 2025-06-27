# Dự án Rút Gọn Link

Ứng dụng rút gọn URL đơn giản: chuyển link dài thành link ngắn, tạo mã QR, theo dõi lượt click.

## Công nghệ chính

* **Frontend:** Next.js, TypeScript, Tailwind CSS
* **Backend:** NestJS, TypeScript, TypeORM
* **Cơ sở dữ liệu:** PostgreSQL

## Cài đặt & Chạy cục bộ

### Database

Tạo bảng `short_urls` trong PostgreSQL.

### Backend (`url-shortener-backend`)

1.  `npm install`
2.  Cấu hình `.env`:
    * `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
    * `BASE_URL=http://localhost:3001`
3.  `npm run start:dev`

### Frontend (`url-shortener-frontend`)

1.  `npm install`
2.  Cập nhật `app/page.tsx`: API backend là `http://localhost:3001/shorten`
3.  `npm run dev`

Truy cập: `http://localhost:3000`
# GoldenBouskoura Server

Express + TypeScript backend for the GoldenBouskoura ecommerce app.

## Stack

- Node.js
- Express
- TypeScript
- Mongoose
- Clerk
- Resend

## Scripts

```bash
npm install
npm run server
```

Available scripts:

```bash
npm run dev
npm run server
npm run build
```

## Environment Variables

Create a `.env` file in `server/` and add:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
ALLOW_START_WITHOUT_MONGODB=true

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

ADMIN_ALERT_EMAIL=your_admin_email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=notifications@yourdomain.com
```

## Notes

- `.env` is ignored by Git.
- If MongoDB Atlas is unavailable, set `ALLOW_START_WITHOUT_MONGODB=true` so the server can still start.
- Real email delivery requires a verified sender domain in Resend.

## Main Routes

Public:

- `GET /`
- `GET /health`

Protected / app routes:

- `GET /protected`
- `POST /orders`
- `GET /orders`
- `POST /admin/notify-order`
- `PATCH /admin/orders/:orderId/status`
- `GET /admin/notifications`
- `PATCH /admin/notifications/:notificationId/read`

## Project Structure

```text
src/
  app.ts
  index.ts
  config/
  routes/
  services/
data/
```

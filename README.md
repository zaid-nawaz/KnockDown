# Knockdown — Live Auction & Bidding Platform

Knockdown is a real-time bidding platform where users can list products for auction with a starting price and deadline. Other users place bids, and the highest bidder at the time of the deadline wins — all powered by live WebSocket updates so everyone sees the action as it happens.

---

## Features

- **List Products for Auction** — Set a product name, description, image, starting price, and bidding deadline.
- **Live Bidding** — Bids update in real time for all connected users via WebSockets.
- **Winner Declaration** — The highest bidder at the deadline is automatically declared the winner.
- **Authentication** — Secure sign-up and login via [Clerk](https://clerk.com).
- **Image Uploads** — Product images hosted via [Cloudinary](https://cloudinary.com).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | Node.js + Express |
| Real-time | WebSockets (ws) |
| Auth | Clerk |
| ORM | Prisma |
| Database | Neon (PostgreSQL) |
| Image Storage | Cloudinary |
| Tunneling | ngrok (for Clerk webhooks) |

---

## Project Structure

```
knockdown/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── lib/
│   │   │   └── db.js              # Prisma client
│   │   ├── routes/
│   │   │   ├── bidding.js
│   │   │   ├── product.js
│   │   │   └── productList.js
│   │   └── ws/
│   │       └── server.js          # WebSocket server
│   └── index.js                   # Express entry point
│
└── frontend/
    └── src/
        └── app/
            ├── list-product/
            │   └── page.tsx       # Product listing page
            ├── products/
            │   └── [productId]/
            │       └── page.tsx   # Individual product / bidding page
            ├── layout.tsx
            └── page.tsx           # Home page
```

---

## Database Schema

```prisma
model User {
  id          Int       @id @default(autoincrement())
  clerkUserId String    @unique
  email       String    @unique
  first_name  String?
  last_name   String?
  imageUrl    String?
  listedProducts Product[] @relation("listedProducts")
  bids        Bid[]
  createdAt   DateTime  @default(now())
}

model Product {
  id            Int      @id @default(autoincrement())
  name          String
  description   String?
  imageUrl      String?
  startingPrice Int
  deadline      DateTime
  isActive      Boolean  @default(true)
  seller        User     @relation("listedProducts", fields: [sellerId], references: [id])
  sellerId      Int
  bids          Bid[]
  createdAt     DateTime @default(now())
}

model Bid {
  id        Int      @id @default(autoincrement())
  amount    Int
  bidder    User     @relation(fields: [bidderId], references: [id])
  bidderId  Int
  product   Product  @relation(fields: [productId], references: [id])
  productId Int
  isAiBid   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=your_neon_postgresql_connection_string
PORT=8000
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_secret
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_secret

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- [ngrok](https://ngrok.com) account with a static forwarding URL

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/knockdown.git
cd knockdown
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` using the variables listed above, then run:

```bash
npx prisma migrate dev
npm run dev
```

The backend will start on `http://localhost:8000`.

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` using the variables listed above, then run:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`.

### 4. Set Up the Clerk Webhook (Required)

Knockdown uses a Clerk webhook to sync user data to your database. You need to expose your local backend via ngrok so Clerk can reach it.

```bash
ngrok http --url=<YOUR_FORWARDING_URL> 8000
```

Then, in your [Clerk Dashboard](https://dashboard.clerk.com):
- Go to **Webhooks** → Add endpoint
- Set the endpoint URL to: `https://<YOUR_FORWARDING_URL>/webhooks/clerk`
- Subscribe to the `user.created` and `user.updated` events
- Copy the signing secret and set it as `CLERK_WEBHOOK_SIGNING_SECRET` in both `.env` files

---

## WebSocket — How Live Bidding Works

When a user opens a product page, the frontend opens a WebSocket connection to the backend. When any user places a bid:

1. The bid is saved to the database via a REST API call.
2. The backend broadcasts the new bid to **all connected clients** watching that product.
3. Every connected user sees the updated bid amount in real time — no refresh needed.

---

## License

MIT — feel free to fork and build on it.

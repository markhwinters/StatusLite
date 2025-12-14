# StatusLite

**StatusLite** is a lightweight full-stack status dashboard web application built with **Next.js** and **Prisma**. It provides a simple way to display, update, and monitor status information—ideal for internal tools, project dashboards, or public status pages.

---

## 🧱 Project Structure

```
StatusLite/
├── app/                      # Next.js application routes & pages
├── components/               # UI components
├── lib/                      # Libraries / helpers (e.g., API utilities)
├── prisma/                   # Prisma schema & migrations
├── public/                   # Static assets
├── .gitignore
├── next.config.ts            # Next.js configuration
├── proxy.ts                  # Custom proxy or API helper
├── prisma.config.ts          # Prisma configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
└── README.md
```

---

## 🚀 Features

- ⚡ Fast & modern UI with Next.js (React)
- 🛠 Prisma ORM for database modeling
- 📊 Simple status dashboards
- 📦 Modular component design
- 🔌 Built-in backend API routes
- 🧪 Ready for extension with authentication, notifications, etc.

---

## 🧩 Tech Stack

| Layer          | Tech                     |
|----------------|--------------------------|
| Frontend       | Next.js, React, TypeScript |
| Backend API    | Next.js API routes       |
| Database Layer | Prisma ORM               |
| Database       | SQLite / PostgreSQL / MySQL |
| Deployment     | Vercel / Netlify / Render |

---

## 📦 Prerequisites

- Node.js (v16+)
- npm or yarn
- A database supported by Prisma (SQLite recommended for local development)

---

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/markhwinters/StatusLite.git
cd StatusLite
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

---

## ⚙️ Configure Environment

Create a `.env` file based on `.env.example` and update your database URL:

```
DATABASE_URL="file:./dev.db"
```

---

## 🛠️ Database Setup (Prisma)

Initialize and migrate your database:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

---

## ▶️ Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser at:

```
http://localhost:3000
```

---

## 📐 Frontend Usage

- Dashboard page to view status items
- Form page to create or update statuses
- Reusable components for consistent UI

---

## 🧪 Testing

If tests are implemented:

```bash
npm test
# or
yarn test
```

---

## 🚢 Deployment

### Vercel (recommended for Next.js)

1. Connect your GitHub repository to Vercel
2. Set environment variables (e.g., `DATABASE_URL`)
3. Deploy

### Other Platforms

- Render
- Netlify
- Heroku

Ensure your production database connection is configured.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

*(Add your preferred license here, e.g., MIT License)*

---

## 📬 Contact

Created by **Mark H. Winters**  
GitHub: https://github.com/markhwinters


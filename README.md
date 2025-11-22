A modern, full-stack Inventory Management System developed with performance and user experience in mind. With a clean **Dark/Neon UI**, instant stock checking and thorough reporting, never lose track of your inventory again.

---

## ✨ Main Features

*   **📊 Dashboard**: KPIs in real-time for total stock value, low stock and active operations.
*   **📦 Inventory**: Comprehensive control over your stock, consisting of warehouses and sites.
*   **🚚 Operations**:
    *   **Receipts**: Unified "New Receipt" form with ability to create vendors from scratch.
    *   **Deliveries**: Exiting stock to clients.
    *   **Internal Transfers**: Transferring stock from internal sites.
*   **🔦 Appearance**: Cool integration of **Dark/Light Mode** for a futuristic Neon theme.
*   **📈 Reporting**: Stock ledger and history.
*   **🔐 Authentication**: Secure, JWT-based authentication for users.

---

## 🛠️ Technology Used

### Frontend (`/client`)
*   React (Vite)
*   Tailwind CSS (Custom Neon Theme)
*   Lucide React
*   Context API
*   React Router DOM

### Backend (`/server`)
*   Node.js
*   Express.js
*   Prisma
*   SQLite (Dev) / PostgreSQL (Prod)
*   JWT & Bcrypt

---

## 🚀 Installation Instructions

### Prerequisites
*   Node.js (v18 or greater)
*   npm (v9 or greater)

## 📂 File Structure

odoo-ps1/
├── client/ # React Client-side
│ ├── src/
│ │ ├── components/ # Reusable components throughout the UI.
│ │ ├── pages/ # The pages of the application (Dashboard, Operations, etc.)
│ │ ├── context/ # Auth and Theme context created.
│ │ └── types/ # TypeScript types.
│ └── ...
├── server/ # Express Server-side
│ ├── prisma/ # Database schema and seed file.
│ ├── src/
│ │ ├── controllers/ # Logic behind request handling
│ │ ├── routes/ # Route definitions for applications API.
│ │ └── middleware/ # Auth middleware.
│ └── ...
└── DEPLOY.md # Deployment Information

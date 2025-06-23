# 🌍 Chemnitz Culture Explorer

**Chemnitz Culture Explorer** is a full-stack interactive map application designed to help users discover cultural places in Chemnitz. Users can search for places, view details, get real-time routes from their current location, and bookmark favorites.

---

## 🛠️ Tech Stack

### 🔹 Frontend
- [Next.js](https://nextjs.org/)
- [Leaflet.js](https://leafletjs.com/)
- [React Context / Axios]
- [Tailwind CSS](https://tailwindcss.com/) *(optional for styling)*

### 🔹 Backend
- [Express.js](https://expressjs.com/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)

### 🔹 Development Tooling
- [npm-run-all](https://www.npmjs.com/package/npm-run-all)

---

## 📁 Project Structure

```
chemnitz-culture-explorer/
├── backend/               # Express + MongoDB API
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── app.js
│   ├── .env
│   └── package.json
├── frontend/              # Next.js + Leaflet UI
│   ├── pages/
│   ├── components/
│   ├── public/
│   ├── .env.local
│   └── package.json
├── package.json           # Root scripts using npm-run-all
└── README.md
```

---

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local or [Atlas](https://www.mongodb.com/atlas))
- Git

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chemnitz-culture-explorer.git
cd chemnitz-culture-explorer
```

### 2. Install Dependencies

From the **root folder**:

```bash
npm install
```

This installs root-level dev tools and installs dependencies inside both `frontend/` and `backend/`.

---

### 3. Environment Configuration

#### 📍 Backend `.env` (`/backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chemnitz-culture
```

#### 🗺️ Frontend `.env.local` (`/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

*(Optional: If using Leaflet with Mapbox tiles, also add:)*

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

---

### 4. Start the Project

From the **root folder**, run:

```bash
npm start
```

This uses `npm-run-all` to run both frontend (at `http://localhost:3000`) and backend (at `http://localhost:5000`) together.

---

## 🧭 How to Use the App

1. **Search**: Use the search bar to find cultural landmarks in Chemnitz.
2. **Map Interaction**: Click any marker to view details of a place.
3. **Bookmark**: Click the star icon to save it to your favorites.
4. **Routing**: Allow location access → click “Get Route” to see navigation from your current location.
5. **Favorites**: View all bookmarked places from your saved list.

---

## 📂 Example API Routes (Backend)

| Method | Endpoint            | Description                    |
|--------|---------------------|--------------------------------|
| GET    | `/api/places`       | Fetch all cultural places      |
| POST   | `/api/places`       | Add a new cultural place       |
| GET    | `/api/places/:id`   | Fetch a single place detail    |
| POST   | `/api/bookmarks`    | Add bookmark for user/session  |
| GET    | `/api/bookmarks`    | Retrieve all user bookmarks    |

---

## 📜 Scripts

### 🔹 Root `/package.json`

```json
{
  "name": "chemnitz-culture-explorer",
  "scripts": {
    "start": "npm-run-all --parallel start:backend start:frontend",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend && npm run dev",
    "install:all": "npm-run-all install:backend install:frontend",
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

> After cloning, simply run `npm install` to install all dependencies and `npm start` to run both servers concurrently.

---

## 🛡️ Permissions

- The app requests **location access** to calculate routes.
- No user data is stored permanently unless authentication is added.

---

## 👤 Author

**Tanzimul**  
Student at TU Chemnitz  
Course: Automotive Software Engineering  
📧 your-email@example.com

---

## 📄 License

This project is developed for educational purposes as part of a university project. It is not intended for commercial use.
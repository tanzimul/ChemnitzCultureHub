# 🌍 ChemnitzCultureHub

**ChemnitzCultureHub** is a full-stack interactive web application that helps users discover, collect, and review cultural sites in Chemnitz. The app features a searchable map (OpenStreetMap + Leaflet), user accounts, favorites, reviews, and a playful "catch 'em all" inventory system.

---

## 🛠️ Tech Stack

### Frontend

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Leaflet.js](https://leafletjs.com/) (interactive maps)
- [Tailwind CSS](https://tailwindcss.com/) (styling)
- [Axios](https://axios-http.com/) (API requests)
- [js-cookie](https://github.com/js-cookie/js-cookie) (auth/session)

### Backend

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (JWT auth)
- [validator](https://www.npmjs.com/package/validator) (input validation)

---

## 📁 Project Structure

```
ChemnitzCultureHub/
├── backend/                # Express + MongoDB API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── .env
├── frontend/               # Next.js + Leaflet UI
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── styles/
│   └── .env.local
├── package.json            # Root scripts using npm-run-all
└── README.md
```

---

## 🚀 Features

- **Map & List View:** Browse cultural sites on an interactive map and as a searchable/filterable list.
- **Categories:** Theatres, museums, artworks, restaurants, and more.
- **Details:** View rich details for each site, including address, website, and description.
- **User Accounts:** Register, login, and manage your profile.
- **Favorites:** Add/remove favorite sites.
- **Visited Sites:** Track and collect sites you’ve visited (auto-detect nearby).
- **Reviews:** Leave and read reviews for cultural sites.
- **Inventory:** "Catch" cultural places and build your collection.
- **Dashboard:** See your favorites, visited, and inventory.
- **OpenStreetMap & Leaflet:** All map data and visualization.

---

## 📡 Data Source

- **OpenStreetMap** (via Overpass API)
- Categories: museums, artworks, theatres, restaurants, tourism spots

---

## 🛠️ API Endpoints (Backend)

| Method | Route                      | Description                     | Auth |
| ------ | -------------------------- | ------------------------------- | ---- |
| POST   | `/api/auth/register`       | Register user                   | ❌   |
| POST   | `/api/auth/login`          | Login user                      | ❌   |
| GET    | `/api/user/me`             | Get user info                   | ✅   |
| PUT    | `/api/user`                | Update user info                | ✅   |
| GET    | `/api/culturalsites`       | List all cultural sites         | ✅   |
| GET    | `/api/culturalsites/:id`   | Get details for a cultural site | ✅   |
| POST   | `/api/users/favorites`     | Add to favorites                | ✅   |
| DELETE | `/api/users/favorites/:id` | Remove from favorites           | ✅   |
| GET    | `/api/users/visited-sites` | Get visited cultural sites      | ✅   |
| PUT    | `/api/users/location`      | Update user's current location  | ✅   |

---

## 🧭 How to Use

1. **Register/Login:** Create an account or sign in.
2. **Explore:** Browse the map or list to find cultural sites.
3. **Details:** Click a marker or list item for more info.
4. **Favorites:** Add sites to your favorites for quick access.
5. **Catch & Review:** Mark sites as visited, leave reviews, and build your collection.
6. **Dashboard:** Manage your favorites, visited, and profile.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v20+)
- MongoDB (Atlas or local)
- Git

---

## 🔧 Installation & Setup

### 01. Installation

```bash
git clone https://github.com/your-username/ChemnitzCultureHub.git
cd ChemnitzCultureHub
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 02. Environment Configuration

- **backend/.env**

  ```
  PORT=5000
  MONGODB_URI=your_mongodb_connection_string
  CLIENT_URL=http://localhost:3000
  JWT_SECRET=your_jwt_secret
  ```

- **frontend/.env.local**
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000
  ```

---

### 03. Running the App

From the root folder:

```bash
npm run dev
```

This uses `npm-run-all` to run both frontend (at `http://localhost:3000`) and backend (at `http://localhost:5000`) together.

Or run backend and frontend separately in their folders.

---

## 🛡️ Permissions

- The app requests **location access** to calculate user current location.
- And for future uses of routing.
- No user data is stored permanently unless authentication is added.

---

## 👤 Author

**Tanzimul**  
Student at TU Chemnitz  
Course: Automotive Software Engineering  
📧 mohammad-tanzimul.alam@s2021.tu-chemnitz.de

---

## 📄 License

This project is developed for educational purposes as part of a university project. It is not intended for commercial use.

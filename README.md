# 🏡 StayHive — Vacation Rental & Accommodation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white" alt="Mapbox" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

> **StayHive** is a full-stack vacation rental web application inspired by Airbnb. It allows users to explore, create, and manage unique properties worldwide, featuring interactive map geocoding, cloud media storage, user authentication, review ratings, and dynamic category filters.

---

## 🌟 Key Features

- **🏠 Comprehensive Listings (CRUD)**: Browse listings with high-resolution imagery, pricing, and descriptions. Authenticated hosts can create, edit, and delete their own properties.
- **🗺️ Interactive Map & Geocoding**: Powered by **Mapbox GL JS** and Mapbox Geocoding SDK. Entering a location automatically plots precise latitude/longitude pins with interactive popups.
- **☁️ Cloud Image Uploads**: Seamless multi-part image uploads directly to **Cloudinary** using `multer` and `multer-storage-cloudinary`.
- **🔐 Secure Authentication & Authorization**:
  - User registration, login, and session persistence using **Passport.js**.
  - Route protection and granular permissions (only property owners can edit/delete their listings; only review authors can delete their reviews).
- **⭐ Reviews & Star Ratings**: Users can leave detailed feedback with interactive animated star ratings powered by **Starability CSS**.
- **🏷️ Category Filtering UI**: Airbnb-style quick-filter bar (Trending, Rooms, Iconic Cities, Mountains, Castles, Pools, Camping, Beachfront, etc.).
- **🔍 Search Bar**: Modern pill-shaped navigation search UI.
- **⚡ Persistent Sessions**: Backed by **Connect-Mongo** session store for reliable production scalability.
- **🛡️ Server-Side & Client-Side Validation**: Robust schema validation using **Joi** alongside Bootstrap form validation and custom error handling (`ExpressError`).

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Backend** | Node.js, Express.js (v5) |
| **Frontend** | EJS (Embedded JavaScript), EJS-Mate, Bootstrap 5, Vanilla CSS3 |
| **Database** | MongoDB, Mongoose ODM |
| **Session & Auth** | `express-session`, `connect-mongo`, `passport`, `passport-local`, `passport-local-mongoose` |
| **Cloud Storage** | Cloudinary SDK, Multer, Multer-Storage-Cloudinary |
| **Maps & Location** | Mapbox GL JS, `@mapbox/mapbox-sdk` |
| **Validation** | Joi |

---

## 📂 Project Structure

```
StayHive/
├── controllers/          # Business logic handlers (MVC)
│   ├── listings.js       # Listing CRUD and geocoding logic
│   ├── reviews.js        # Review creation and deletion logic
│   └── users.js          # Authentication and user registration logic
├── init/                 # Database initialization & seed data
│   ├── data.js           # Sample properties dataset
│   └── index.js          # Seeding script
├── models/               # Mongoose schemas
│   ├── listing.js        # Listing schema with GeoJSON geometry
│   ├── review.js         # Review schema with rating and author
│   └── user.js           # User schema integrated with Passport-Local-Mongoose
├── public/               # Static assets
│   ├── css/              # Custom stylesheets (style.css, rating.css)
│   └── js/               # Client-side scripts (map.js, script.js)
├── routes/               # Express route definitions
│   ├── listing.js        # /listings routes
│   ├── review.js         # /listings/:id/reviews routes
│   └── user.js           # Auth routes (/signup, /login, /logout)
├── utils/                # Helper utilities
│   ├── ExpressError.js   # Custom HTTP error class
│   └── wrapAsync.js      # Async error boundary wrapper
├── views/                # EJS templates
│   ├── includes/         # Partials (navbar, footer, flash alerts)
│   ├── layouts/          # Boilerplate layout (boilerplate.ejs)
│   ├── listings/         # Listing views (index, show, new, edit)
│   └── users/            # Auth views (login, signup)
├── cloudConfig.js        # Cloudinary storage configuration
├── middleware.js         # Auth checks (isLoggedIn, isOwner, isReviewAuthor, validation)
├── schema.js             # Joi validation schemas
├── app.js                # Application entry point & server setup
├── .env                  # Environment variables (secret credentials)
└── package.json          # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or a MongoDB Atlas URI)
- A free [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A free [Mapbox](https://www.mapbox.com/) account (for access tokens)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aniketrajpoot15/StayHive.git
   cd StayHive
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following keys:

   ```env
   # Cloudinary Credentials
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret

   # Mapbox Public Access Token
   MAP_TOKEN=your_mapbox_public_token

   # Session Secret
   SECRET=your_super_secret_session_key

   # MongoDB Connection (Optional: defaults to local MongoDB if omitted)
   # ATLASDB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stayhive?retryWrites=true&w=majority
   ```

4. **Initialize / Seed Sample Data** *(Optional)*:
   Populate the database with curated sample listings:
   ```bash
   node init/index.js
   ```

5. **Start the Development Server**:
   ```bash
   node app.js
   ```
   *(Or run `nodemon app.js` for automatic server reloading on file changes).*

6. **View the Application**:
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 🗺️ Key Routes & Endpoints

| Method | Endpoint | Description | Protected |
|---|---|---|:---:|
| `GET` | `/` | Redirects to `/listings` | No |
| `GET` | `/listings` | Show all listings | No |
| `GET` | `/listings/new` | Form to create a new listing | ✅ Yes |
| `POST` | `/listings` | Add a new listing (with image upload & geocoding) | ✅ Yes |
| `GET` | `/listings/:id` | View listing details, map, and reviews | No |
| `GET` | `/listings/:id/edit` | Form to edit an existing listing | ✅ Owner only |
| `PUT` | `/listings/:id` | Update listing details or replace image | ✅ Owner only |
| `DELETE` | `/listings/:id` | Delete listing and its associated reviews | ✅ Owner only |
| `POST` | `/listings/:id/reviews` | Submit a review and rating | ✅ Yes |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete a review | ✅ Author only |
| `GET` / `POST` | `/signup` | User registration | No |
| `GET` / `POST` | `/login` | User login session | No |
| `GET` | `/logout` | Terminate user session | No |

---

## 🔒 Security & Best Practices

- **Password Hashing**: Utilizes PBKDF2 hashing with unique salts via `passport-local-mongoose`.
- **Session Security**: Uses HTTP-only cookies with expiration settings and encrypted session state in MongoDB.
- **Environment Isolation**: Sensitive API keys and credentials are saved in `.env` and excluded via `.gitignore`.
- **Cascade Deletion**: When a listing is removed, a Mongoose `post("findOneAndDelete")` hook cleans up all linked reviews.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).

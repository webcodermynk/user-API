# Week 3 – User REST API (Node.js + Express + MongoDB)

A small REST API for managing users, with Mongoose for the database and JWT for authentication.

## What's covered

1. REST API for managing users
2. Express connected to MongoDB through Mongoose
3. Full CRUD on users
4. JWT login/registration (passwords hashed with bcrypt)
5. Postman collection to test every route

## Setup

You need Node.js 18+ and MongoDB running locally (or a MongoDB Atlas connection string).

```bash
npm install
npm start
```

The `.env` file is already included with local defaults. To use Atlas, change `MONGO_URI` in `.env`.
Use `npm run dev` if you want auto-restart on file changes (nodemon).

## Routes

| Method | Route | Auth | What it does |
|--------|-------|------|--------------|
| POST | `/api/users/register` | No | Create account, returns token |
| POST | `/api/users/login` | No | Login, returns token |
| GET | `/api/users/me` | Yes | Current user's profile |
| GET | `/api/users` | Yes | List all users |
| GET | `/api/users/:id` | Yes | Get one user |
| PUT | `/api/users/:id` | Yes | Update user (own profile, or admin) |
| DELETE | `/api/users/:id` | Yes | Delete user (own account, or admin) |

Protected routes need this header:

```
Authorization: Bearer <your_token>
```

## Testing with Postman

1. Open Postman → **Import** → pick `Week3_User_API.postman_collection.json`
2. Make sure the server is running on port 5000
3. Run the requests in order (1 → 9). Register and Login automatically save the token and user id into collection variables, so you don't need to copy anything.
4. Or use the **Runner** to run the whole collection at once. Every request has a status-code test.

## Folder structure

```
week3-user-api/
├── config/db.js              # Mongoose connection
├── controllers/userController.js
├── middleware/auth.js        # JWT check
├── models/User.js
├── routes/userRoutes.js
├── server.js
├── .env
└── Week3_User_API.postman_collection.json
```

## Notes

- Passwords are hashed with bcrypt and never returned in responses.
- To make someone an admin for testing, change their `role` to `admin` directly in MongoDB (Compass or mongosh).
- Change `JWT_SECRET` in `.env` before deploying anywhere.

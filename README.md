# Notes App

## Description
A CRUD notes API with search and tagging features. Built with Node.js and Express, this backend allows users to create, read, update, delete, and search notes efficiently.


## Features
- User authentication (signup, login) with JWT
- Signup includes name, email, phone, password
- Email OTP verification for new users (Mailtrap integration)
- Only verified users can log in
- Passwords hashed with bcrypt
- All note routes protected by JWT authentication middleware
- Create, read, update, and delete notes
- Tagging system for better organization
- Search functionality for notes
- RESTful API design

## Installation & Usage
```bash
# Clone the repo
git clone https://github.com/<your-username>/notes-app-api.git

# Navigate into the project
cd notes-app-api

# Install dependencies
npm install

# Start the server
npm start
```

## Environment Variables
Create a `.env` file with:
```
MONGO_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your_jwt_secret

EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
```

## API Endpoints
- `POST /api/auth/signup` — Register user (name, email, phone, password)
- `POST /api/auth/verify-otp` — Verify OTP sent to email
- `POST /api/auth/login` — Login (returns JWT)
- All `/api/notes/*` routes require JWT in `Authorization: Bearer <token>`

## Technologies
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- nodemailer (Mailtrap)

## Author
NOAH LUCKY
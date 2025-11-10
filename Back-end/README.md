# Backend - University Library System

Express.js backend server with MongoDB and GridFS for file storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/university-library
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

3. Start MongoDB (if running locally)

4. Run the server:
```bash
npm start
# or
npm run dev  # with nodemon for auto-reload
```

## API Documentation

### Authentication Endpoints

#### Register
- **POST** `/api/auth/register`
- Body: `{ name, email, password, role }`
- Returns: `{ token, user }`

#### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ token, user }`

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user }`

### Department Endpoints

#### Get All Departments
- **GET** `/api/departments`
- Returns: Array of departments

#### Get Department with Books
- **GET** `/api/departments/:id`
- Returns: `{ department, books }`

#### Create Department (Teachers Only)
- **POST** `/api/departments`
- Headers: `Authorization: Bearer <token>`
- Body: `{ name, description? }`
- Returns: Department object

### Book Endpoints

#### Get All Books
- **GET** `/api/books?department=id` (optional query)
- Returns: Array of books

#### Get Single Book
- **GET** `/api/books/:id`
- Returns: Book object

#### Upload Book (Teachers Only)
- **POST** `/api/books`
- Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- Body: FormData with `title`, `author`, `department`, `file`
- Returns: Book object

#### Delete Book (Teachers Only, Own Books)
- **DELETE** `/api/books/:id`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ message }`

### File Endpoints

#### Download File
- **GET** `/api/files/:fileId`
- Headers: `Authorization: Bearer <token>`
- Returns: File stream

## Models

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String ('teacher' | 'student')

### Department
- name: String (unique)
- description: String

### Book
- title: String
- author: String
- department: ObjectId (ref: Department)
- uploadedBy: ObjectId (ref: User)
- fileId: ObjectId (GridFS file ID)
- fileName: String
- fileSize: Number
- mimeType: String

## Middleware

- `authenticate`: Verifies JWT token
- `isTeacher`: Ensures user is a teacher
- `isStudent`: Ensures user is a student


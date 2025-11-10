# Quick Start Guide

## Prerequisites Check

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running (or MongoDB Atlas account)

## Step-by-Step Setup

### 1. Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod
```

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**Or use MongoDB Atlas:**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Backend Setup

```bash
cd Back-end
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/university-library
JWT_SECRET=my-super-secret-jwt-key-change-this
NODE_ENV=development
```

Start backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see: `Server running on port 5000` and `MongoDB Connected`

### 3. Frontend Setup

Open a new terminal:

```bash
cd Front-end
npm install
```

Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

The app will open at `http://localhost:3000`

## First Steps

1. **Register a Teacher Account:**
   - Go to Register page
   - Fill in details
   - Select "Teacher" role
   - Register

2. **Create Departments:**
   - **Option 1 (Recommended):** Run the seed script to create sample departments:
     ```bash
     cd Back-end
     npm run seed
     ```
   - **Option 2:** Create via API after login:
     ```bash
     curl -X POST http://localhost:5000/api/departments \
       -H "Authorization: Bearer YOUR_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"name": "Computer Science", "description": "CS Department"}'
     ```

3. **Upload a Book:**
   - Click "Upload Book" in navbar
   - Fill in book details
   - Select a PDF or Word document
   - Upload

4. **Register a Student Account:**
   - Logout
   - Register with "Student" role
   - Browse departments and download books

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify MONGODB_URI in `.env`
- For Atlas, ensure IP whitelist includes your IP

### Port Already in Use
- Change PORT in backend `.env`
- Update REACT_APP_API_URL in frontend `.env`

### File Upload Fails
- Check file size (max 50MB)
- Ensure file is PDF or Word format
- Check MongoDB connection

### CORS Errors
- Ensure backend is running
- Check API URL in frontend `.env`

## Testing the API

You can test the API using curl or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"teacher"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get departments (with token)
curl http://localhost:5000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

- Customize the UI colors and styling
- Add more file types support
- Implement search functionality
- Add book categories/tags
- Implement book ratings/reviews


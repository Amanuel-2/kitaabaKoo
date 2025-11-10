# Frontend - University Library System

React frontend application with React Router for navigation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation bar
│   ├── Navbar.css
│   └── PrivateRoute.js    # Protected route wrapper
├── pages/
│   ├── Home.js            # Departments listing
│   ├── Home.css
│   ├── Department.js      # Books in a department
│   ├── Department.css
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration page
│   ├── Auth.css           # Shared auth styles
│   ├── UploadBook.js      # Book upload (teachers)
│   └── UploadBook.css
├── context/
│   └── AuthContext.js     # Authentication context
├── services/
│   └── api.js             # Axios API client
├── App.js                 # Main app component
├── App.css
├── index.js              # Entry point
└── index.css             # Global styles
```

## Features

- **Authentication**: Login and registration with role selection
- **Department Browsing**: View all departments on homepage
- **Book Listing**: View books in each department
- **Book Upload**: Teachers can upload books (PDF/Word)
- **Book Download**: Students can download books
- **Role-based UI**: Different features for teachers vs students
- **Responsive Design**: Works on mobile and desktop

## Components

### Navbar
- Shows navigation links
- Displays user name and role
- Logout button
- Upload link (teachers only)

### PrivateRoute
- Protects routes requiring authentication
- Redirects to login if not authenticated

### Pages

#### Home
- Lists all departments
- Click department to view books

#### Department
- Shows books in selected department
- Download button for each book
- Delete button for teachers (own books only)

#### Login/Register
- Form-based authentication
- Role selection in registration

#### UploadBook
- Form for uploading books
- Department selection
- File upload with validation

## Context API

### AuthContext
Provides:
- `user`: Current user object
- `loading`: Loading state
- `login(email, password)`: Login function
- `register(name, email, password, role)`: Register function
- `logout()`: Logout function
- `isTeacher`: Boolean
- `isStudent`: Boolean

## API Integration

All API calls are made through the `api.js` service using Axios. The service automatically includes the JWT token in requests when available.

## Styling

- CSS modules for component-specific styles
- Responsive design with media queries
- Modern, clean UI with consistent color scheme


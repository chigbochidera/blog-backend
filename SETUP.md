# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
1. Copy `env.example` to `.env`
2. Update the following variables in `.env`:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-platform?retryWrites=true&w=majority

# JWT Secret (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-here

# JWT Expiration (optional, defaults to 7d)
JWT_EXPIRE=7d

# Server Port (optional, defaults to 5000)
PORT=5000

# Environment (development/production)
NODE_ENV=development
```

### 3. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string and update `MONGODB_URI` in `.env`

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Test the API
```bash
# Run the test script
npm test
```

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run API tests
- `npm run test:api` - Run API tests (alias)

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password

#### Blogs
- `GET /blogs` - Get all published blogs
- `GET /blogs/:id` - Get single blog
- `POST /blogs` - Create blog (auth required)
- `PUT /blogs/:id` - Update blog (owner/admin)
- `DELETE /blogs/:id` - Delete blog (owner/admin)
- `PUT /blogs/:id/like` - Like/unlike blog

#### Comments
- `GET /comments/:blogId` - Get comments for blog
- `POST /comments/:blogId` - Add comment (auth required)
- `PUT /comments/:id` - Update comment (owner/admin)
- `DELETE /comments/:id` - Delete comment (owner/admin)
- `PUT /comments/:id/like` - Like/unlike comment

## 🧪 Testing with Postman

1. Import the following collection or create requests manually:

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Create Blog (use token from login)
```
POST http://localhost:5000/api/blogs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post. It should be at least 50 characters long to pass validation.",
  "tags": ["technology", "web development"],
  "status": "published"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB Atlas connection string
   - Ensure your IP is whitelisted
   - Verify database user credentials

2. **JWT Token Issues**
   - Make sure JWT_SECRET is set in .env
   - Check token expiration time
   - Verify Authorization header format: `Bearer <token>`

3. **Validation Errors**
   - Check required fields
   - Ensure password meets requirements (6+ chars, uppercase, lowercase, number)
   - Verify email format

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

### Logs
- Development logs are shown in console
- Production logs can be configured with logging services
- Check MongoDB Atlas logs for database issues

## 🚀 Deployment

### Heroku Deployment
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Connect GitHub repository
4. Enable automatic deploys

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
PORT=5000
```

## 📞 Support

If you encounter any issues:
1. Check the logs for error messages
2. Verify environment variables
3. Test with the provided test script
4. Check MongoDB Atlas connection
5. Open an issue in the repository

---

**Happy Coding! 🎉**

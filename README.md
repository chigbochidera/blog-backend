# Blog Platform Backend

A complete backend API for a blogging platform built with Node.js, Express, MongoDB Atlas, and JWT authentication. This platform supports user registration, blog creation, commenting system, and role-based access control.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Role-Based Access Control**: Admin and user roles with different permissions
- **Blog Management**: Full CRUD operations for blog posts
- **Comment System**: Nested comments with replies support
- **Security**: Password hashing, input validation, rate limiting, and security headers
- **Search & Filtering**: Search blogs by content and filter by tags/author
- **Pagination**: Efficient data pagination for large datasets
- **Like System**: Users can like blogs and comments

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - Object Document Mapper
- **JWT** - JSON Web Token for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `env.example` to `.env`
   - Update the environment variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-platform?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Software developer and blogger"
}
```

#### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

### Blog Endpoints

#### Get All Blogs
```http
GET /api/blogs?page=1&limit=10&search=keyword&tags=tech,web&author=user_id
```

#### Get Single Blog
```http
GET /api/blogs/:id
```

#### Create Blog
```http
POST /api/blogs
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "excerpt": "Short description of the blog post",
  "tags": ["technology", "web development"],
  "status": "published"
}
```

#### Update Blog
```http
PUT /api/blogs/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Blog Title",
  "content": "Updated content..."
}
```

#### Delete Blog
```http
DELETE /api/blogs/:id
Authorization: Bearer <jwt_token>
```

#### Like/Unlike Blog
```http
PUT /api/blogs/:id/like
Authorization: Bearer <jwt_token>
```

#### Get User's Blogs
```http
GET /api/blogs/user/:userId?page=1&limit=10
```

#### Get My Blogs (including drafts)
```http
GET /api/blogs/my/blogs?page=1&limit=10
Authorization: Bearer <jwt_token>
```

### Comment Endpoints

#### Get Comments for Blog
```http
GET /api/comments/:blogId?page=1&limit=10
```

#### Add Comment
```http
POST /api/comments/:blogId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Great blog post! Thanks for sharing."
}
```

#### Reply to Comment
```http
POST /api/comments/:commentId/reply
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Thanks for your comment!"
}
```

#### Update Comment
```http
PUT /api/comments/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer <jwt_token>
```

#### Like/Unlike Comment
```http
PUT /api/comments/:id/like
Authorization: Bearer <jwt_token>
```

## 🔐 User Roles & Permissions

### User Role
- Create, edit, and delete own blog posts
- Comment on any blog post
- Like blogs and comments
- Update own profile

### Admin Role
- All user permissions
- Create, edit, and delete any blog post
- Manage all users
- Access admin-only endpoints

## 📊 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Environment Variables**: Sensitive data stored in environment variables

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  avatar: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model
```javascript
{
  title: String,
  content: String,
  excerpt: String,
  author: ObjectId (ref: User),
  tags: [String],
  featuredImage: String,
  status: String (enum: ['draft', 'published']),
  views: Number,
  likes: [ObjectId (ref: User)],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  content: String,
  author: ObjectId (ref: User),
  blog: ObjectId (ref: Blog),
  parentComment: ObjectId (ref: Comment),
  isEdited: Boolean,
  editedAt: Date,
  likes: [ObjectId (ref: User)],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
PORT=5000
```

### Deployment Steps
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)
4. Update CORS origins for production domain

## 🧪 Testing

You can test the API using tools like:
- **Postman**
- **Insomnia**
- **Thunder Client** (VS Code extension)
- **curl** commands

### Example curl commands:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# Get all blogs
curl -X GET http://localhost:5000/api/blogs
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

**Happy Blogging! 🎉**

## 🧑‍💼 Default Admin Account

An initial admin user has been seeded for convenience in development/testing:

- Email: `admin@yourdomain.com`
- Password: `StrongPassword123`

Change this password immediately after first login (or run the seeding script again with a new password):

```bash
npm run seed:admin -- "Admin" admin@yourdomain.com "NewStrongPassword123"
```

Security note: Never commit your `.env` file. Use `env.example` to share required variables.

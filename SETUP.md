# 🌍 EarthTogether - Setup Guide

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   mongodb.net/
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

3. **Database Setup**
   - Start MongoDB locally or use MongoDB Atlas
   - The app will automatically create the database and collections

4. **Run the Application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
Earth/
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── middleware/       # Authentication & validation
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── App.js        # Main app component
│   └── public/           # Static assets
├── server.js         # Express server
├── package.json      # Backend dependencies
└── README.md         # Project overview
```

## Features Implemented

✅ **Backend**
- User authentication (JWT)
- User management
- Habit tracking system
- Social feed (posts)
- Challenge system
- RESTful API endpoints

✅ **Frontend**
- Beautiful landing page
- User authentication (login/register)
- Responsive navigation
- Modern UI with Tailwind CSS

🚧 **Coming Soon**
- Dashboard with habit tracking
- Social feed interface
- Challenge participation
- Profile management
- Admin panel
- News, memes, and quizzes

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get user data
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create habit
- `GET /api/posts` - Get social feed
- `POST /api/posts` - Create post
- `GET /api/challenges` - Get challenges
- `POST /api/challenges` - Create challenge

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Tailwind CSS, React Router
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Development

### Adding New Features
1. Create models in `models/` directory
2. Add routes in `routes/` directory
3. Create React components in `client/src/components/`
4. Add pages in `client/src/pages/`

### Database Models
- **User**: Authentication, profile, eco-points, badges
- **Habit**: Eco-habits with tracking and streaks
- **Post**: Social feed posts with likes/comments
- **Challenge**: Eco-challenges with participation

## Deployment

### Backend (Render/Heroku)
```bash
npm run build
# Deploy to your preferred platform
```

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy build folder to Vercel
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**EarthTogether** - Making eco-habits fun, social, and rewarding! 🌱✨

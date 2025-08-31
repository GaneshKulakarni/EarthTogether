# 🌍 EarthTogether

**EarthTogether** is a MERN stack application designed to inspire eco-friendly habits, foster a supportive community, and make sustainable living fun through gamification, social sharing, and education.

---

## 🚀 Vision
Many people want to live sustainably but struggle to build consistent eco-habits. EarthTogether provides a platform where users can:
- Track eco-friendly actions daily.
- Share their eco-journey with a community.
- Compete in fun challenges.
- Get recognized for making a real difference.
- Learn and spread environmental awareness in engaging ways (news, memes, quizzes, games).

---

## 🛠️ Tech Stack
- **Frontend:** React (with Tailwind/Material UI for UI, React Router for navigation)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (JSON Web Tokens)
- **Image Handling:** Gemini API for content + NanoBanana (AI-generated eco-memes/images)
- **Hosting:** Vercel (Frontend) + Render/Heroku (Backend) + MongoDB Atlas (DB)

---

## 📱 Core Features (Frontend + Backend Details)

### 1. 🌐 Landing / Sign Up
- **Frontend:** Beautiful landing page with Earth visuals and motivational eco slogans. Sign-up/login buttons.
- **Backend:** User registration & login with JWT authentication.
- **Detail:** Allow sign up via email/password + OAuth (Google optional). Store user profile info in MongoDB.

---

### 2. 📊 Dashboard
- **Frontend:** 
  - Shows **today's checklist** of eco-habits.  
  - Displays **daily environmental quote** auto-generated from backend.  
  - Quick stats: streak count, points, carbon saved estimate.  
- **Backend:** API to fetch personalized daily checklist, motivational quotes, and habit stats.  
- **Detail:** This is the user’s **home base**. Simple, gamified UI with green progress bars.

---

### 3. 📰 Feed / Post Creation
- **Frontend:** Social feed like LinkedIn/Twitter. Users can post text, images, or eco-tips.  
- **Backend:** Post schema with text, image link, likes, comments.  
- **Detail:** Posts should include **user’s eco-actions** (with photos) and allow likes/comments to inspire others.  

---

### 4. ✅ Habit Manager
- **Frontend:** Section for users to **create/edit/delete eco-habits**.  
- **Backend:** Habit schema storing habit name, frequency, streaks.  
- **Detail:** Habits like *“Use cloth bag instead of plastic”*, *“Switch off lights”*. System tracks streaks & awards eco-points.

---

### 5. 🏆 Leaderboard
- **Frontend:** Display users ranked by **eco-points, streaks, and verified impact**.  
- **Backend:** Aggregate points and return sorted leaderboard data.  
- **Detail:** Highlights **top eco-contributors**. Should also show metrics like **waste reduced, carbon saved, energy saved** (calculated from actions).

---

### 6. 🎯 Challenges
- **Frontend:** Users can join challenges like *“Plastic-Free Week”*. Submit **evidence photos/videos**.  
- **Backend:** Challenge schema with participants, submissions, and verification.  
- **Detail:** Gamify with badges & certificates for completed challenges.  

---

### 7. 📰 News (Editorial Section)
- **Frontend:** Curated news feed highlighting **real stories of users** and global environmental updates.  
- **Backend:** Admin dashboard to create/manage news articles.  
- **Detail:** Every week, feature **one exceptional user** from EarthTogether with their story. This builds community motivation.  

---

### 8. 😂 Meme Page
- **Frontend:** Page showing fun, shareable memes about eco-habits and environment.  
- **Backend:** Meme collection schema + integration with **NanoBanana AI for meme/image generation**.  
- **Detail:** Engaging & funny memes educate people better. Users can like/share memes within the platform.  

---

### 9. 🎮 Quiz & Games
- **Frontend:** Flashcards, quizzes, and mini eco-games to test knowledge.  
- **Backend:** Quiz schema with questions, answers, scoring.  
- **Detail:** Reward points for participation, promote learning while having fun.  

---

### 10. 👤 Profile
- **Frontend:** User profile with picture, bio, eco-points, badges, certifications.  
- **Backend:** API to fetch user’s progress, achievements, and history.  
- **Detail:** Certificates generated automatically when a user completes a challenge or milestone.  

---

### 11. 🛡️ Admin Panel
- **Frontend:** Admin dashboard for content moderation, approving posts, publishing news, managing memes.  
- **Backend:** Role-based access control (admin vs user).  
- **Detail:** Ensure platform quality and positivity. Admins can **spotlight users** for great contributions.  

---

## 🌟 Extra Features
1. **Daily Motivation Page** → Auto-updated with eco-quotes to inspire users.  
2. **Community Help Forum** → Users can share eco-friendly hacks & get advice.  
3. **Carbon Savings Estimator** → Calculate approximate CO₂ saved from habits.  
4. **Push Notifications / Emails** → Remind users to log eco-habits.  
5. **Certificates & Badges** → PDF/Badge generation upon milestones.  

---

## 🎯 Goals
- Make eco-habits fun, sticky, and social.  
- Build a **green LinkedIn-style community**.  
- Inspire millions to act daily for the environment.  

---

## 🔮 Future Scope
- Integrate **AI habit recommendations** (suggest sustainable habits).  
- Partner with **NGOs/brands** to reward users with real perks.  
- Add **carbon footprint tracking via IoT or integrations** (smart meters, fitness apps).  

---

## 📌 Summary
EarthTogether = **Eco Habits + Social Sharing + Education + Fun + Recognition**.  
This platform aims to be **LinkedIn + Duolingo + Instagram** but for saving the planet 🌍.  

---

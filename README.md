# Eclipser

**Eclipser** is a full-stack open-source platform for student networking, collaboration, and competitive programming. Built on the motto _"Creating Better Individuals"_, it enables students to:

- Connect via one-to-one messaging
- Share posts and discussions on topics they care about
- Compete in coding contests with real-time leaderboards

---

## 🚀 Features

- 👥 **User Authentication**: JWT-based secure login, signup, and profile management.
- 💬 **Real-time Chat**: One-to-one messaging using Socket.IO and MongoDB.
- 📰 **Post System**:
  - Tag-based post creation, subscription, and filtering
  - Real-time post updates via WebSockets
  - Infinite scroll with caching (Service Worker)
- ⚔️ **Coding Contests**:
  - Create and participate in programming contests
  - Live evaluation and leaderboard tracking
- 🎯 **Topic Subscriptions**: Personalized feeds by following specific topics/tags.
- 🔄 **Redis Optimization**: Online presence tracking, real-time subscriptions, and pub/sub for performance.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **Redis** (for pub/sub, caching, online user tracking)
- **Socket.IO** (real-time chat & updates)

### Frontend
- **React + Vite**
- **Tailwind CSS**
- **React Router**
- **Socket.IO Client**
- **Service Workers** (for offline cache & infinite scroll)

---

## 🧑‍💻 Getting Started

### ✅ Prerequisites

- Node.js (v18 or later)
- MongoDB (local or cloud like MongoDB Atlas)
- Redis (local or Docker)

---

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eclipser.git
   cd eclipser```

2.**Backend Setup**

    Configure environment variables in backend/.env (MongoDB URI, Redis URI, JWT secret, etc.)

    Install dependencies and start:
      
       cd backend
       npm install
       npm run dev

3.**Frontend Setup**

    Install and start the React app:
         
           cd frontend
           npm install
           npm run dev

---

###🤝 Contributing

We welcome contributions! Please check out CONTRIBUTING.md for more info.

---

###📄 License

Licensed under the MIT License. See the LICENSE file for details.


---

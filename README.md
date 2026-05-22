
## Project Name: 
### DevPulse

### 🔗 Live API
Base URL: [https://ass2-theta.vercel.app/](https://ass2-theta.vercel.app/)


### 🚀 Key Features
- There are two roles, maintainer and contributor
- Maintainer and contributor can register and get their access, they should login
- Maintainer can create, update, and delete any issue
- Contributor also can create issue and they can update their own issues and only if status is open
 


### 🛠 Tech Stack
#### BackEnd
- Express.js
- TypeScript
- pg
- PostgreSQL
- tsx (for dev server)
- vercel (deployment)
- dotenv
- jwt
- bycrypt

### API Endpoints

1. Register:
   ```bash
   POST /api/auth/signup
2. Login:
   ```bash
   POST /api/auth/login
3. Create Issue:
   ```bash
   POST /api/issues
4. Get All Issues:
   ```bash
   GET /api/issues
5. Get single Issue:
   ```bash
   GET /api/issues/:id
6. Update Issue:
   ```bash
   PATCH /api/issues/:id
6. Delete Issue:
   ```bash
   DELETE /api/issues/:id

### ⚙️ Setup Guide

1. Clone the repo:
   ```bash
   git clone https://github.com/Enamul-Haque-Shojib/vehicle_rental_system.git
   cd vehicle_rental_system
2. Install dependencies:
    ```bash
    npm install
3. Set up .env file:
    ```env
    CONNECTIONSTRING, PORT, JWT_SECRET, JWT_REFRESH_SECRET
4. Start the server:
    ```bash
    npm run dev
5. The server will run on https://ass2-theta.vercel.app/ by default.
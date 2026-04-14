Install Requirements

Make sure you have installed:

- Node.js (LTS version)
- PostgreSQL

Check Node is installed:

```bash
node -v
npm -v
```

Clone the Repository
```in terminal
git clone <REPO_URL>
cd fronted 'for frontend terminal'
cd backend 'for backend terminal'
```

Install Dependencies
```
npm install

npm install bcryptjs
```

Envirovement 
```create an .env file
PORT=4000
DATABASE_URL=postgresql://postgres:Password1@localhost:5432/foodie_control
JWT_SECRET=super_secret_key
```

Run it
```
npm run dev
```

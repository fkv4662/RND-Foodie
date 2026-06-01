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
git clone <https://github.com/fkv4662/RND-Foodie.git>
cd fronted 'for frontend terminal'
cd backend 'for backend terminal'
```

Install Dependencies
```
npm install

npm install bcryptjs
```

Envirovement 
create an .env file and paste this
```
PORT=4000
DATABASE_URL=postgresql://postgres:Password1@localhost:5432/(YOUR DATABASE NAME CREATED)
JWT_SECRET=super_secret_key

- Then in the terminal run this (npm install dotenv)
```
```
- Then Install PostgresSQL if not install
- Then run (CREATE DATABASE foodie_control;)
- Go back to vscode and start the server if connected should say 'Database connected'
```

Run it
```
npm run dev
```

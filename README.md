# M47R1X8AA2
## Configuration
1. Copy file `backend/example.env` to `backend/.env`
2. Set application settings like database connection, secret key, etc

WARNING: do NOT use `DB_SYNC=true` in production!

## Development setup
```bash
cd backend
npm install
cd ../frontend
npm install
```
Run `dev-server.bat` for starting development servers or use this:
```bash
cd backend
npm run dev # monitor for any changes in backend and automatically restart the server
```
```bash
cd frontend
npm run dev # monitor for any changes in frontend and automatically restart the server
```

## Database migration (M47R1X8AA, MSSQL => M47R1X8AA2, MySQL)
0. You need to create table schema with `npx typeorm schema:sync` (look at [Production Deployment](#production-deployment))
1. Copy file `migration-utility/example.env` to `migration-utility/.env`
2. Set connection settings
3. Set `MYSQL_TRUNCATE=false` if you don't want to truncate mysql tables before migration
4. Set `MIGRATE_FILES=true` if you want to migrate photos and quentas
  1. Set `CLEAR_FILES=false` if you don't want to remove files in `migration-utility/new-data`
  2. Place all photos in `migration-utility/old-data/Avatars`
  3. Place all quentas in `migration-utility/old-data/Quenta`
5. Run:
```bash
cd migration-utility
npm install # only for first time
npm run build # npm run build-win on Windows, only for first time
npm start
```
6. Move `migration-utility/new-data` to `backend/public`

## Production deployment
```bash
cd shared
npm install

cd ../frontend
npm install
npm run build

cd ../backend
npm install --production
npm run build # npm run build-win on Windows
npx typeorm schema:sync # create database tables

npm run prod # start production server
# OR run it through PM2:
pm2 start
```
Example of nginx config:
```nginx
server {
       listen 80;
       listen [::]:80;

       server_name example.com;

       root path_to_this_repo/frontend/dist;
       index index.html;

       location /api/ {
         proxy_pass http://localhost:3000/;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
       }

       location / {
         try_files $uri $uri/ /index.html =404;
       }

       location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
         # Some basic cache-control for static files to be sent to the browser
         expires max;
         add_header Pragma public;
         add_header Cache-Control "public, must-revalidate, proxy-revalidate";
       }
}
```
@echo off
cd /d %~dp0
cd backend
echo Starting backend server...
start npm run dev
cd ../frontend
echo Starting frontend server...
start npm run dev
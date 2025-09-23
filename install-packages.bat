@echo off
echo Installing server packages...
cd server
npm install bcryptjs jsonwebtoken express-validator @google/generative-ai
echo Server packages installed!
echo.
echo Restarting server...
node server.js
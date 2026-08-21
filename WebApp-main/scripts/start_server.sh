#!/bin/bash

echo "Starting backend with PM2..."

cd /home/ec2-user/WebApp/Backend

pm2 describe backend > /dev/null
if [ $? -eq 0 ]; then
    pm2 restart backend
else
    pm2 start server.js --name backend
fi

pm2 save
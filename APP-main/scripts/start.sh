#!/bin/bash
cd /home/ec2-user/App
pm2 stop backend || true
pm2 start server.js --name backend
pm2 save

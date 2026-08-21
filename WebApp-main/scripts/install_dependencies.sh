#!/bin/bash

echo "Fixing permissions..."
sudo chown -R ec2-user:ec2-user /home/ec2-user/WebApp

echo "Installing backend dependencies..."
cd /home/ec2-user/WebApp/Backend
npm install
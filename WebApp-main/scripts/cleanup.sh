#!/bin/bash

echo "Cleaning old deployment..."

rm -rf /home/ec2-user/WebApp/*

mkdir -p /home/ec2-user/WebApp
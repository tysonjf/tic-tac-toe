#!/bin/bash

# Script to restart a PM2 process using ecosystem.config.js

# Set the name of the application as defined in ecosystem.config.js
APP_NAME="tic-tac-toe-server"

# Stop the PM2 process
echo "Stopping PM2 process..."
pm2 stop $APP_NAME

# Delete the PM2 process
echo "Deleting PM2 process..."
pm2 delete $APP_NAME

# Start the PM2 process using ecosystem.config.js
echo "Starting PM2 process..."
pm2 start ecosystem.config.js --env production

# Save the current PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "PM2 process restarted successfully."

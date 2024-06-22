#!/bin/bash

# Script to restart a PM2 process using ecosystem.config.js

echo "Installing client dependencies..."

# install dependencies
npm run install:client
# if installing fails, stop the script
if [ $? -ne 0 ]; then
  echo "Installing client dependencies failed."
  exit 1
fi

# build the server files
npm run build:client
# if building fails, stop the script
if [ $? -ne 0 ]; then
  echo "Building client files failed."
  exit 1
fi

npm run start:server
# if installing fails, stop the script
if [ $? -ne 0 ]; then
  echo "Starting server container failed."
  exit 1
fi
exit 0

# # install server dependencies
# npm run install:server
# # if installing fails, stop the script
# if [ $? -ne 0 ]; then
#   echo "Installing client files failed."
#   exit 1
# fi
#
# # install server dependencies
# npm run build:server
# # if installing fails, stop the script
# if [ $? -ne 0 ]; then
#   echo "Building server files failed."
#   exit 1
# fi
#
# # Set the name of the application as defined in ecosystem.config.js
# APP_NAME="tic-tac-toe-server"
#
# # Stop the PM2 process
# echo "Stopping PM2 process..."
# pm2 stop $APP_NAME
#
# # Delete the PM2 process
# echo "Deleting PM2 process..."
# pm2 delete $APP_NAME
#
# # Start the PM2 process using ecosystem.config.js
# echo "Starting PM2 process..."
# npm run start:server
# if [ $? -ne 0 ]; then
#   echo "Starting PM2 process failed."
#   exit 1
# fi
#
# # Save the current PM2 process list
# echo "Saving PM2 process list..."
# pm2 save
#
# echo "PM2 process restarted successfully."
# exit 0

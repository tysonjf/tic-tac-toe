# Build the client

# Set the path to the client
cd client

# Install the dependencies
pnpm install
if [ $? -ne 0 ]; then
  echo "Failed to install the dependencies"
  exit 1
fi

# Build the client
pnpm build
if [ $? -ne 0 ]; then
  echo "Failed to build the client"
  exit 1
fi

# Return to the root directory
cd ..

# Exit successfully
echo "Successfully built the client"
exit 0

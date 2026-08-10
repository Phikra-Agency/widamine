#!/bin/bash

# Kill existing API server
echo "Stopping existing API server..."
pkill -f "nest start"
sleep 2

# Start API server
echo "Starting API server..."
cd /home/alae/Documents/repos/widamine/api
npm run dev


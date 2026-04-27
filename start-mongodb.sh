#!/bin/bash
# MongoDB Startup Script for Widamine

MONGO_DATA_DIR="/data/db"
MONGO_LOG_DIR="/var/log/mongodb"
PID_FILE="/tmp/mongod.pid"

# Create directories if they don't exist
mkdir -p $MONGO_DATA_DIR $MONGO_LOG_DIR

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is already running!"
    echo "Connection URL: mongodb://127.0.0.1:27017/widamine"
    exit 0
fi

# Start MongoDB
echo "Starting MongoDB..."
mongod --fork --logpath $MONGO_LOG_DIR/mongod.log --dbpath $MONGO_DATA_DIR --bind_ip 127.0.0.1 --port 27017

if [ $? -eq 0 ]; then
    echo "MongoDB started successfully!"
    echo "Connection URL: mongodb://127.0.0.1:27017/widamine"
    echo "Data directory: $MONGO_DATA_DIR"
    echo "Log file: $MONGO_LOG_DIR/mongod.log"
else
    echo "Failed to start MongoDB"
    exit 1
fi

# Function to stop MongoDB
stop_mongodb() {
    echo "Stopping MongoDB..."
    mongod --dbpath $MONGO_DATA_DIR --shutdown 2>/dev/null || pkill -x mongod
    echo "MongoDB stopped."
}

# Handle script termination
trap stop_mongodb EXIT INT TERM

# Keep script running if --keep-alive flag is passed
if [ "$1" = "--keep-alive" ]; then
    echo "MongoDB is running. Press Ctrl+C to stop."
    while true; do
        sleep 1
    done
fi

exit 0

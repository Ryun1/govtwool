#!/bin/bash
# Quick test script to verify Yaci Store can start properly

INDEXER_DIR="/Users/ryan/hackathons/govtwool/indexer"
JAR_FILE="$INDEXER_DIR/yaci-store-all-0.1.6.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "JAR file not found: $JAR_FILE"
    exit 1
fi

echo "Testing Yaci Store startup..."
cd "$INDEXER_DIR"

# Start with clean log
rm -f yaci-store.log

# Start Java process
java -jar "$JAR_FILE" > yaci-store.log 2>&1 &
JAVA_PID=$!

echo "Started with PID: $JAVA_PID"
sleep 3

# Check if still running
if ps -p $JAVA_PID > /dev/null 2>&1; then
    echo "✓ Process is running"
    echo "Log file contents:"
    cat yaci-store.log
    kill $JAVA_PID
else
    echo "✗ Process died"
    echo "Log file contents:"
    cat yaci-store.log
    exit 1
fi


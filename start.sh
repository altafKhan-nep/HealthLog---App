#!/bin/bash
echo "Starting HealthLog API..."
cd "$(dirname "$0")/apps/api" && npm run dev &
API_PID=$!

echo "Starting HealthLog Mobile..."
cd "$(dirname "$0")/apps/mobile" && npx expo start --clear &
MOBILE_PID=$!

echo ""
echo "API running on http://localhost:4000"
echo "Mobile running on http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $API_PID $MOBILE_PID 2>/dev/null; exit" INT TERM
wait

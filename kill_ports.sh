#!/bin/bash

# List of ports to kill (covering both dev and Docker ports, deduplicated)
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 4200 80 8080 5173 5174 4201 4202 4203 4204 4205 4206 4207 4208 4209 9600)

# Function to kill process on a given port
kill_port() {
    local port=$1
    # Find the process ID (PID) using lsof
    pid=$(lsof -t -i:$port)
    
    if [ -n "$pid" ]; then
        echo "Found process on port $port with PID: $pid"
        # Attempt to kill the process
        kill -9 $pid
        if [ $? -eq 0 ]; then
            echo "Successfully killed process on port $port"
        else
            echo "Failed to kill process on port $port"
        fi
    else
        echo "No process found on port $port"
    fi
}

# Iterate through the ports and kill any processes
for port in "${PORTS[@]}"; do
    kill_port $port
done

echo "All specified ports have been processed."
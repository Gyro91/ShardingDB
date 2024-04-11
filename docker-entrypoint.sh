#!/bin/bash

set -e

# Check if the data directory is empty
if [ ! -z "$(ls -A /var/lib/postgresql/data)" ]; then
    # Data directory is not empty, start PostgreSQL service
    exec "$@"
else
    # Data directory is empty, initialize PostgreSQL database cluster
    # Execute the initialization script before starting PostgreSQL
    docker-entrypoint-initdb.d/init.sql

    # Start PostgreSQL service
    exec "$@"
fi

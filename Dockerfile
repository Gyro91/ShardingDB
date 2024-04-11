# Use the official PostgreSQL image as the base
FROM postgres

# Copy the SQL script to a location in the container
COPY init.sql /docker-entrypoint-initdb.d/

# Change the permission of the script to make it executable (optional)
RUN chmod +x /docker-entrypoint-initdb.d/init.sql

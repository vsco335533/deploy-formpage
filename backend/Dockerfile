# # Backend Dockerfile for Flask app
# FROM python:3.10-slim

# # Set work directory
# WORKDIR /app

# # Install dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the backend code
# COPY . .

# # Expose the port Flask runs on
# EXPOSE 5000

# # Set environment variables
# ENV FLASK_APP=app.py
# ENV FLASK_RUN_HOST=0.0.0.0

# # Run the Flask app
# CMD ["flask", "run"]



FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
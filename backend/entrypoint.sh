#!/bin/sh

# Seed templates (ignore errors if already seeded)

python add_templates.py || true

# Start Gunicorn server

exec gunicorn --bind 0.0.0.0:5000 app:app


#!/bin/sh
if [ -f /vault/secrets/api-key ]; then
  . /vault/secrets/api-key
fi

exec python app.py


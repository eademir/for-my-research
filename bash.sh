#!/bin/bash

# Prompt the user to enter the tag
read -p "Enter the tag: " tag

# Run the wget command with the specified tag
wget --post-data "query=get_taginfo&tag=${tag}&limit=1000" https://mb-api.abuse.ch/api/v1/

# Move the resulting index.html to index.json
mv index.html index.json
#!/bin/bash
# Generate Axios client for Rolla API

rollaApiRoot=$(jq -r '.rollaApiRoot' ./src/rollaApi.config.json)
curl "$rollaApiRoot/yield/mm-api-docs/json" > ./src/restApi/mm-api.json

npx prettier -w ./src/restApi/mm-api.json
## use jq to remove all tag keys. That will generate a single Api class that contains all the methods, as opposed to one class per tag
jq 'walk(if type == "object" and has("tags") then del(.tags) else . end)' ./src/restApi/mm-api.json > ./src/restApi/mm-api-tags-removed.json

npx openapi-generator-cli generate --generator-key rolla

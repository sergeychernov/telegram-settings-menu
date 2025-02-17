#!/bin/bash

scriptPath=$(dirname $0)

source ${scriptPath}/env-string.sh
source .env
functionEnv=`envString packages/$1/.env`

# echo $functionEnv

yc serverless function version create \
  --function-name=$1 \
  --runtime nodejs18 \
  --entrypoint index.handler \
  --memory 256m \
  --execution-timeout 30s \
  --source-path ./packages/$1/dist.zip \
  --service-account-id=$SERVICE_ACCOUNT_ID \
  --environment $functionEnv \
  --cloud-id $CLOUD_ID \
  --folder-id $FOLDER_ID

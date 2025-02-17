#!/bin/bash
# создает версию функции

source ./.env

if yc serverless function get $1 --cloud-id $CLOUD_ID --folder-id $FOLDER_ID; then
    echo "Функция с данным именем уже существует"
else
    echo "Создать $1"
    yc serverless function create \
    --name=$1 \
    --cloud-id $CLOUD_ID \
    --folder-id $FOLDER_ID
    yc serverless function allow-unauthenticated-invoke $1 \
    --cloud-id $CLOUD_ID \
    --folder-id $FOLDER_ID
fi


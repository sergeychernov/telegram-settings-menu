# Демо бот для работы с меню настроек
tele-menu-demo-bot

## Установка через Yandex Cloud

### 1. Подключение к базе данных YDB

https://yandex.cloud/ru/docs/ydb/tutorials/connect-from-cf-nodejs

### 2. Что прописать в .env в корне проекта

CLOUD_ID={id Облака}
FOLDER_ID={id Каталога}
SERVICE_ACCOUNT_ID={id Сервисного аккаунта}

### 3. .env в пакете функции

BOT_TOKEN={токен, полученный от BotFather}

Переменные полученные на этапе создания YDB

ENDPOINT=
DATABASE=

SA_KEY_FILE={имя файла с ключами для доступа к YDB}

### 2. Создайте функцию в yandex cloud

./scripts/create-func.sh tele-menu-demo-bot

Демонстрация работы меню
# Меню настроек Telegram

Простая и гибкая библиотека для создания меню настроек в Telegram-ботах на основе [Telegraf](https://github.com/telegraf/telegraf).

## Установка

Установите пакет с помощью npm или yarn:

```sh
npm install telegram-settings-menu
```

или

```sh
yarn add telegram-settings-menu
```

## Возможности

- Легко создавайте и управляйте меню настроек для вашего бота
- Поддержка inline-клавиатуры
- Гибкая настройка параметров
- Поддержка TypeScript

## Использование

Пример интеграции `telegram-settings-menu` в бота на Telegraf:

```ts
import { SettingsMenu, UserContext } from 'telegram-settings-menu';
import settingsSchema from './settings.json'; // Генерируется с помощью telegram-settings-menu-generator
import { Telegraf } from 'telegraf';
import { Settings } from './settings'; 
import { Schema } from 'ts-json-schema-generator';


const bot = new Telegraf(process.env.BOT_TOKEN);
const userStateDB: Record<number, UserContext<Settings>> = {};

const menu = new SettingsMenu<Settings>(settingsSchema as Schema, bot, {
  getUserContext: async (id: number) => {
    return userStateDB[id];
  },
  updateUserContext: async (userContext) => {
    userStateDB[userContext.id] = userContext;
    return true;
  }
});

bot.command('settings', async (ctx) => {
  await menu.show(ctx);
});

// Пример обработки обновлений в бессерверной среде (например, Yandex Cloud Functions)
export const handler: Handler.Http = async (event: Http.Event) => {
  const message = JSON.parse(event.body);
  await bot.handleUpdate(message);
  return {
    statusCode: 200,
    body: '',
  };
};
```

## API

### `new SettingsMenu(schema: Schema, bot: Telegraf, options: MenuOptions)`

Создаёт новый объект меню настроек.

#### Параметры `MenuOptions`

| Свойство            | Тип                                             | Описание                                                              |
|----------------------|-------------------------------------------------|--------------------------------------------------------------------------|
| `getUserContext`    | `(userId: number) => Promise<UserContext<T>>` | Асинхронная функция, получающая контекст настроек пользователя по его ID.  Должна вернуть объект `UserContext` содержащий настройки пользователя. |
| `updateUserContext` | `(userContext: UserContext<T>) => Promise<boolean>` | Асинхронная функция, обновляющая контекст настроек пользователя. Возвращает `true` при успешном обновлении, `false` в противном случае. |


### `menu.show(ctx: Context)`

Отображает меню настроек пользователю в контексте `ctx`.

## Пример

Демо-бот доступен: https://t.me/tele_menu_demo_bot

## Переводы

[Английский](README.md)
[Русский](README.ru.md)

## Лицензия

Этот проект распространяется по лицензии MIT.


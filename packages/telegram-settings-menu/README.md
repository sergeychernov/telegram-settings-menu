# Telegram Settings Menu

A simple and flexible settings menu generator for Telegram bots using [Telegraf](https://github.com/telegraf/telegraf).

## Installation

Install the package via npm or yarn:

```sh
npm install telegram-settings-menu
```

or

```sh
yarn add telegram-settings-menu
```

## Features

- Easily create and manage a settings menu for your bot
- Supports inline keyboards
- Customizable options
- TypeScript support

## Usage

Here's a basic example of how to integrate `telegram-settings-menu` with a Telegraf bot:

```ts
import { SettingsMenu, UserContext } from 'telegram-settings-menu';
import settingsSchema from './settings.json'; // Generated using telegram-settings-menu-generator
import { Telegraf } from 'telegraf';

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
Creates a new settings menu.

#### `MenuOptions`
| Property        | Type     | Description                                        |
|---------------|---------|------------------------------------------------|
| `getUserContext` | function | Retrieves the user's settings context         |
| `updateUserContext` | function | Updates the user's settings context         |

### `menu.show(ctx: Context)`
Displays the settings menu to the user.

## Example

https://t.me/tele_menu_demo_bot



## License

This project is licensed under the MIT License.

---

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
Создает новое меню настроек.

#### `MenuOptions`
| Свойство        | Тип     | Описание                                      |
|---------------|---------|--------------------------------------------|
| `getUserContext` | function | Получает контекст настроек пользователя |
| `updateUserContext` | function | Обновляет контекст настроек пользователя |

### `menu.show(ctx: Context)`
Отображает меню настроек пользователю.

## Лицензия

Этот проект распространяется по лицензии MIT.


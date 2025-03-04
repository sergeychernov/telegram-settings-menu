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
// Example for handling updates in a serverless environment (e.g., Yandex Cloud Functions)
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
| `getUserContext` | (id: number) => Promise<UserContext> | Retrieves the user's settings context         |
| `updateUserContext` | (userContext: UserContext) => Promise<boolean> | Updates the user's settings context. Returns true on success.         |

### `menu.show(ctx: Context)`
Displays the settings menu to the user.

## Example

A demo bot is available: https://t.me/tele_menu_demo_bot

## Translations

[English](README.md)
[Russian](README.ru.md)

## License

This project is licensed under the MIT License.


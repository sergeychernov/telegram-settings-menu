# Telegram Settings Menu Monorepo

This monorepo contains three packages designed to create a flexible and easy-to-use settings menu for Telegram bots using [Telegraf](https://github.com/telegraf/telegraf):

- **telegram-settings-menu** – A library for managing settings menus in Telegram bots.
- **telegram-settings-menu-generator** – A CLI tool for generating a settings schema from TypeScript types.
- **tele-menu-demo-bot** – A demo bot deployed on Yandex Cloud Functions that demonstrates the usage of `telegram-settings-menu`.

## Installation

You can install each package separately depending on your needs.

### `telegram-settings-menu`
```sh
npm install telegram-settings-menu
```
```sh
yarn add telegram-settings-menu
```

### `telegram-settings-menu-generator`
```sh
npm install -g telegram-settings-menu-generator
```
```sh
yarn global add telegram-settings-menu-generator
```

## Features

- Easily create and manage a settings menu for your Telegram bot
- Supports inline keyboards
- Supports nested settings
- Uses TSDoc notation for detailed descriptions
- TypeScript support
- Compatible with Yandex Cloud Functions

## Usage

### `telegram-settings-menu`
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

For more details, see the full documentation: [telegram-settings-menu](https://www.npmjs.com/package/telegram-settings-menu)

### `telegram-settings-menu-generator`
This package generates a JSON schema based on TypeScript types using TSDoc notation. Example usage:

```sh
telegram-settings-menu-generator --path ./settings.ts --to ./settings.json
```

Example TypeScript type for menu configuration:

```ts
/**
 * @title Settings
 */
export type Settings = {
	/**
     * @title Subscription to News
     */
	subscriptionToNews?: boolean;

	/**
	 * @default 'Daily'
	 * @title Period
	 * @format inline
	 */
	period: 'Every Minute' | 'Every Hour' | 'Daily';

	/**
	 * @title Boolean
	 */
	boolean: {
		/**
		 * @title Without Default
		 */
		withoutDefault?: boolean;

		/**
		 * @default false
		 * @title Default false
		 */
		defaultFalse: boolean;
		/**
		 * @default true
		 * @title Default true
		 */
		defaultTrue: boolean;
	}
};
```

For more details, see the full documentation: [telegram-settings-menu-generator](https://www.npmjs.com/package/telegram-settings-menu-generator)

### `tele-menu-demo-bot`
This is a demo bot designed to run on Yandex Cloud Functions, demonstrating how to use `telegram-settings-menu` in a serverless environment.


#### Try the Demo Bot: [@tele_menu_demo_bot](https://t.me/tele_menu_demo_bot)

## License
This project is licensed under the MIT License.


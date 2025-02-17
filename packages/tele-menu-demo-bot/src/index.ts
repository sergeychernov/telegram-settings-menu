import { Handler } from '@yandex-cloud/function-types';
import { Http } from '@yandex-cloud/function-types/dist/src/http';
import { Telegraf } from 'telegraf';

import settingsSchema from './settings.json';
import { type Settings } from './settings';
import { SettingsMenu, type UserContext } from 'telegram-settings-menu';
import { type Schema } from 'ts-json-schema-generator';

if (!process.env.BOT_TOKEN) {
	process.exit(-1);
}

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
//bot.start((ctx) => ctx.reply(`Hello. \nMy name Serverless Hello Telegram Bot \nI'm working on Cloud Function in the Yandex Cloud.`))

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
})
  
bot.telegram.setMyCommands([ {command:'settings', description:'Настройки'}])

export const handler: Handler.Http = async (event: Http.Event) => {
	const { X_YCF_VSOCK_PORT, X_YCF_RUNTIME_POOL, NODE_OPTIONS, LD_LIBRARY_PATH, PATH, AWS_LAMBDA_RUNTIME_API, LAMBDA_RUNTIME_DIR, LAMBDA_TASK_ROOT, X_YCF_CONCURRENCY, X_YCF_MEMORY_SIZE, X_YCF_WORKER_ID, _HANDLER, ...env } = process.env;

	const message = JSON.parse(event.body);

	await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
}

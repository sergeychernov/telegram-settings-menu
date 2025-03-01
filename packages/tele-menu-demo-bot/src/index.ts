import { Handler } from '@yandex-cloud/function-types';
import { Http } from '@yandex-cloud/function-types/dist/src/http';
import { Context, Telegraf } from 'telegraf';

import settingsSchema from './settings.json';
import { type Settings } from './settings';
import { SettingsMenu, type UserContext } from 'telegram-settings-menu';
import { type Schema } from 'ts-json-schema-generator';
import { initDb, upsertUserContext, getUserContext as getUserContextDB, upsertUserId } from './db';
import * as fs from 'fs';
import { escapeMarkdown } from './markdown';

if (!process.env.BOT_TOKEN) {
	process.exit(-1);
}

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
// Link example for this bot (@tele_menu_demo_bot):
// https://t.me/tele_menu_demo_bot?start=<user_id>
// This link will send the /start command with the <user_id> as a parameter.

bot.start(async (ctx) => {
  const userIdFromQuery = ctx.message?.text?.split(' ')[1]; // Extract userId from command arguments (/start 12345)
  let userId: string;
  if (userIdFromQuery) {
      userId = userIdFromQuery;
  }
  let replyText = `Hello! \nMy name is Serverless Settings Bot\nI'm working on Cloud Function in the Yandex Cloud.\n`;
  if (!userId) {
    replyText += `Please use the link with user ID like this: https://t.me/tele_menu_demo_bot?start=<user_id>`;
  } else {
    replyText += `Your id is ${ctx?.from?.id} -> ${userId} `;
    await upsertUserId(ctx?.from?.id, userId);
  }
  
  await ctx.reply(replyText);
});
const menu = new SettingsMenu<Settings>(settingsSchema as Schema, bot, {
  getUserContext: async (id: number) => {
    return getUserContextDB<Settings>(id);
  },
  updateUserContext: async (userContext: UserContext<Settings>, telegramUserContext) => {
    await upsertUserContext(userContext.id, userContext);
    return true;
  }
});

bot.command('settings', async (ctx) => {
  await menu.show(ctx);
})

bot.command('version', async (ctx) => {
  const rawData = fs.readFileSync('./package.json', 'utf-8');
  const jsonData = JSON.parse(rawData);
  await ctx.replyWithMarkdownV2(escapeMarkdown(`Bot: ${jsonData?.version}\nMenu: ${jsonData?.dependencies?.['telegram-settings-menu']}`));
})
  
bot.telegram.setMyCommands([ {command:'settings', description:'Настройки'}, {command:'version', description:'Версия'}])

export const handler: Handler.Http = async (event: Http.Event) => {
	const { X_YCF_VSOCK_PORT, X_YCF_RUNTIME_POOL, NODE_OPTIONS, LD_LIBRARY_PATH, PATH, AWS_LAMBDA_RUNTIME_API, LAMBDA_RUNTIME_DIR, LAMBDA_TASK_ROOT, X_YCF_CONCURRENCY, X_YCF_MEMORY_SIZE, X_YCF_WORKER_ID, _HANDLER, ...env } = process.env;
  await initDb();
	const message = JSON.parse(event.body);

	await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
}

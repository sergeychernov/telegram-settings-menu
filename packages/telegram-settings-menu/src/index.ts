import { Context } from "telegraf";
import { InlineKeyboardButton, Message, Update } from "telegraf/types";
import { Markup, Telegraf } from 'telegraf';
import { type Schema } from 'ts-json-schema-generator';
import isEqual from "lodash.isequal";
function escapeStringRegexp(input:string) {
	if (typeof input !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return input
		.replace(/[|\\{}()[\]^$+*?.\/]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}

// Рекурсивно получает вложенное значение
function getNestedValue<T>(obj: T, path: string[]): any {
	return path.reduce((acc, key) => (acc as any)?.[key], obj);
}

// Рекурсивно устанавливает вложенное значение
function setNestedValue(obj: any, path: string[], value: any): void {
	let ref = obj;
	for (let i = 0; i < path.length - 1; i++) {
		if (!ref[path[i]]) ref[path[i]] = {};
		ref = ref[path[i]];
	}
	ref[path[path.length - 1]] = value;
}

// Получение текущего значения свойства
function getIcon<T>(state: T,  path:string[]=[]): string {
	const currentValue = getNestedValue(state, path);
	if (currentValue === undefined) {
		return "🔲"; // Неопределённое состояние
	}
	return currentValue ? "✅" : "❌";
}

type SchemaPath = string[];
type TelegramContext = Context<{ message: Update.New & Update.NonChannel & Message.TextMessage; update_id: number; }> & Omit<Context<Update>, keyof Context<Update>>;
		

type Property = 
{
	description?: string;
	title?: string;
	format?: string;
	role?: string[];
	
} &(
	{
		type: "boolean";
		default?: boolean;
	} |
	{
		type: "object";
		properties?: { [key:string]: Property };
	} |
	{
		type: "string";
		enum: string[];
		default?: string;
		format?: 'inline'|'submenu';
	}
)
export type UserContext<T> = {
	id: number;
	message_id?: number;
	state: T;
	path: string[];
}
export class SettingsMenu<T> {
  
    private schema: Schema;
	private indexMap: Map<number, string[]>;
    private reverseIndexMap: Map<string, number>;
	private bot: Telegraf<Context<Update>>;
	private getUserContext: (id: number) => Promise<UserContext<T>>;
	private updateUserContext: (userContext: UserContext<T>, telegramContext: Context) => Promise<boolean>;

	constructor(schema: Schema, bot: Telegraf<Context>, options: {
		getUserContext: (id:number)=>Promise<UserContext<T>>,
		updateUserContext?: (userContext: UserContext<T>, telegramContext: Context) => Promise<boolean>,
	}) {
		this.schema = schema;
		this.bot = bot;
		this.getUserContext = options.getUserContext;
		this.updateUserContext = options.updateUserContext || (async (userContext: UserContext<T>, telegramContext: Context) => { console.log('The function updateUserContext requires implementation'); return true; });

		this.indexMap = new Map();
        this.reverseIndexMap = new Map();

		this.indexSchema();
		this.subscribeToActions();
	}
	// Обработка нажатий на кнопки
	private async handleButtonPress(telegramContext: Context,[index, ...rest]: number[] ) {
		let userContext = await this.getUserContext(Number(telegramContext?.from?.id));
		const gettedUserContext = JSON.parse(JSON.stringify(userContext));
		const path = this.getPath(index);
		userContext = { ...userContext, path };
		const propertySchema = this.getPropertyByPath(path);
		if (propertySchema && userContext) {
			if (index < 0) {
				userContext = { ...userContext }
			} else if (propertySchema.type === 'object') {
				userContext = { ...userContext }
			} else if (propertySchema.type === 'boolean') {
				const currentValue = getNestedValue(userContext.state, path);
				const newValue = currentValue === undefined ? true : !currentValue;
				setNestedValue(userContext.state, path, newValue);
			} else if (propertySchema.type === 'string') {
				const pathToString = path.slice(0, -1);
				const value = path[path.length - 1];
				if (propertySchema.format === 'inline' && rest.length === 1) {
					setNestedValue(userContext.state, pathToString, value);
				}
			}
			if (!isEqual(gettedUserContext, userContext))
			{
				await this.updateUserContext(userContext, telegramContext);
				const keyboard = this.createKeyboard(userContext, path);
				await this.bot.telegram.editMessageText(userContext.id, userContext.message_id, undefined, this.getTitlesByPath(path).join(' > '), Markup.inlineKeyboard(keyboard));
			}
		} else {
			console.log('!propertySchema || !userContext', !!propertySchema,!!userContext,path, index);
			console.log(JSON.stringify(this.schema?.definitions?.Settings));
		}
		await telegramContext.answerCbQuery();
	}

	private subscribeToActions() {
		const actionRegExp = new RegExp(escapeStringRegexp(this.schema.$ref + ':')+'(-?\\d+):?(\\d+)?');
		this.bot.action(actionRegExp, async (ctx) => {
			const indexes: number[] = [];
			for (let i = 1; i < ctx.match?.length; i++){
				indexes.push(parseInt(ctx.match?.[i]));
			}
			await this.handleButtonPress( ctx, indexes);
		});
	}
	public async show(telegramContext: Context) {
		const id = telegramContext.from.id;
		let userContext = await this.getUserContext(id) || { id, state:this.initializeStateWithDefaults(), path:[]};
		
		const keyboard = this.createKeyboard(userContext, []);
		const message = await telegramContext.reply(this.getTitlesByPath([]).join(' > '), Markup.inlineKeyboard(keyboard));
		userContext = { ...userContext, message_id: message.message_id };
		await this.updateUserContext(userContext, telegramContext);
	}

	// 🔹 Рекурсивно индексирует схему
	private indexSchema() { 

	    let indexCounter: number = 1;
		const inner = (obj: Property, path: string[] = []) => {
			if (obj && obj.type === "object" && obj.properties) {
				for (const key in obj.properties) {
					const uniqueIndex = indexCounter++;
					const fullPath = [...path, key];
	
					this.indexMap.set(uniqueIndex, fullPath);
					this.reverseIndexMap.set(fullPath.join("."), uniqueIndex);
	
					inner( obj.properties[key], fullPath);
				}
			}
			if (obj && obj.type === "string" && obj.enum.length > 0) {
				for (const value of obj.enum) {
					const uniqueIndex = indexCounter++;
					const fullPath = [...path, value];
	
					this.indexMap.set(uniqueIndex, fullPath);
					this.reverseIndexMap.set(fullPath.join("."), uniqueIndex);
				}
			}
		}
		inner(Object.entries(this.schema.definitions)[0][1] as Property);
	}

	// 🔹 Метод, создающий state с default значениями из схемы
	private initializeStateWithDefaults() {
		function inner(schema: Property, path: string[] = []) {
			if (schema.type === "object" && schema.properties) {
				const obj: any = {};
				for (const key in schema.properties) {
					const propertySchema = schema.properties[key];
					if ("default" in propertySchema) {
						obj[key] = propertySchema.default;
					} else if (propertySchema.type === "object") {
						obj[key] = inner(propertySchema, [...path, key]);
					}
				}
				return obj;
			}
			return undefined;
		}
		return inner(Object.entries(this.schema.definitions)[0][1] as Property) as T;
    }
	
	// 🔹 Получает уникальный индекс по пути и ключу
    public getIndex(path: string[]): number {
        const fullPath = path.join(".");
        return this.reverseIndexMap.get(fullPath) ?? (path.length === 0?0: -1);
    }

    // 🔹 Получает path и key по индексу
    public getPath(index: number): string[] {
        return this.indexMap.get(Math.abs(index)) || [];
    }

    // Получение настроек по текущему пути
	private getPropertyByPath(path: SchemaPath = []) {
        return path.reduce((acc, key) => acc.type === 'object'? acc?.properties?.[key] as Property: acc, this.schema?.definitions?.Settings as Property);
    }
	
	// 🔹 Получает массив заголовков (title) по path
    private getTitlesByPath(path: string[]): string[] {
		let currentSchema = Object.entries(this.schema.definitions)[0][1] as Property ;
		const titles: string[] = [currentSchema.title];

		let currentPath = [...path];
		let propertySchema = this.getPropertyByPath(path);
		
		if (propertySchema.type === 'object') {
			currentPath = path;
		} else if(propertySchema.type === 'string' && propertySchema.format === 'inline'){
			currentPath = path.slice(0, -2);
		} else if (propertySchema.type === 'string' && propertySchema.format != 'inline') {
			currentPath = path;
		} else {
			currentPath = path.slice(0, -1);
		}

		for (const key of currentPath) {
			if (currentSchema.type === 'object') {
				currentSchema = (currentSchema.properties[key] as Property);
				titles.push(currentSchema.title);
			} else {
				break;
			}
        }

        return titles;
	}
	
	private createButton(path: string[], propertySchema: Property, state: T, subButton: boolean = false): InlineKeyboardButton[] {
		let callback_data = this.schema.$ref + ':' + this.getIndex(path);
		let text = '';
		if (propertySchema.type === 'string') {
			if (propertySchema.format === 'inline') {
				return propertySchema.enum.map((option, i) => {
					return ({
						text: option === getNestedValue<T>(state, path) ? `✅ ${option}` : `🔘 ${option}`,
						callback_data: this.schema.$ref + ':' + this.getIndex([...path, option])
					})
				});
			} else {
				if (subButton) {
					text = `${path[path.length - 1]}`;
					callback_data = this.schema.$ref + ':' + this.getIndex(path);
				} else {;
					text = `${propertySchema.title}: ${getNestedValue<T>(state, path)} ⚙️`;
				}
				
			}
		}
		else if (propertySchema.type === "boolean") {
			text = `${propertySchema.title} ${getIcon<T>(state, path)}`;
		} else if (propertySchema.type === "object") {
			text = `📂 ${propertySchema.title}`;
		}
		return [{
			text,
			callback_data
		}];
	}

    // Генерация inline-клавиатуры
	public createKeyboard(userContext: UserContext<T>, path: string[]): InlineKeyboardButton[][] {
		let currentPath = [...path];
		let propertySchema = this.getPropertyByPath(path);
		
		if (propertySchema.type === 'object') {
			currentPath = path;
		} else if(propertySchema.type === 'string' && propertySchema.format === 'inline'){
			currentPath = path.slice(0, -2);
			propertySchema = this.getPropertyByPath(currentPath);
		} else if (propertySchema.type === 'string' && propertySchema.format != 'inline') {
			currentPath = path;
		} else {
			currentPath = path.slice(0, -1);
			propertySchema = this.getPropertyByPath(currentPath);
		}
        if (!propertySchema) throw new Error("Некорректная схема: путь не найден.");

		const buttons: InlineKeyboardButton[][] = [];
		if (currentPath.length > 0) {
			buttons.push([{
				text: "🔙 Наверх",
				callback_data: this.schema.$ref + ':' +`-${this.getIndex(currentPath.slice(0, -1))}`
			}]);
		}
		
		if (propertySchema.type === 'object') {
			for (const [key, value] of Object.entries(propertySchema.properties)) {
				const button = this.createButton([...currentPath, key], value, userContext.state);
				buttons.push(button);
			}
		} else if (propertySchema.type === 'string' && propertySchema.format != 'inline') {
			for (const value of propertySchema.enum) {
				const fullPath = [...currentPath, value];
				const button = this.createButton(fullPath, propertySchema, userContext.state, true)
				buttons.push(button);
			}
		}
        return buttons;
    }
}

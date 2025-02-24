

import { Driver, getSACredentialsFromJson, IamAuthService, RowType, ResultSet, TypedValues } from 'ydb-sdk';
import { logger } from '../logger';
import { UserContext } from 'telegram-settings-menu';

async function checkTableExists(tableName: string) {
    const schemeClient = driver.schemeClient;
    try {
		const result = await schemeClient.describePath(`/${tableName}`);
        logger.debug(`Таблица ${tableName} существует`, result);
        return true;
    } catch (error: any) {
        if (error.message.includes('NOT_FOUND')) {
            logger.debug(`Таблица ${tableName} не найдена`);
            return false;
        }
        throw error;
    }
}

export async function getUserContext<T>( id: number): Promise<UserContext<T> | null> {
    const query = `
        DECLARE $id AS Int64;

        SELECT context FROM UserContext
        WHERE id = $id;
    `;

	return await driver.tableClient.withSession(async (session) => {
		const preparedQuery = await session.prepareQuery(query);
		const resultSet = await session.executeQuery(preparedQuery, {
			$id: TypedValues.int64(id),
		});
		// Проверяем, есть ли данные
		if (resultSet.resultSets.length === 0 || resultSet.resultSets[0].rows.length === 0) {
			return null; // Если нет данных, возвращаем null
		}
	
		// Достаём JSON из результата
		const row = resultSet.resultSets[0].rows[0];
		const contextValue = row.items[0];
	
		if (!contextValue || !contextValue.textValue) {
			return null;
		}
	
		return JSON.parse(contextValue.textValue);
	});
    
}

export async function upsertUserContext(id: number, context: object) {
	const query = `
		DECLARE $id AS Int64;
        DECLARE $context AS Json;
        UPSERT INTO UserContext (id, context)
        VALUES ($id, $context);
    `;

	await driver.tableClient.withSession(async (session) => {
		const preparedQuery = await session.prepareQuery(query);
		await session.executeQuery(preparedQuery, {
			$id: TypedValues.int64(id),
			$context: TypedValues.json(JSON.stringify(context)),
		});
		
	});
    

    console.log(`UserContext с id=${id} обновлён.`);
}

async function createTables() {
	if (!checkTableExists('UserContext')) {
		await driver.queryClient.doTx({
			txSettings: { serializableReadWrite: {} },
			fn: async (session) => {
			logger.debug(`CREATE TABLE UserContext`);
			await session.execute({
				text: `
				CREATE TABLE UserContext
				(
					id Int64,
					context Json,
					PRIMARY KEY (id)
				);`
	
			});
			}
		});
	}
}
export async function convertResultSetsToObjects<T>(resultSets: AsyncGenerator<ResultSet, any, any>) {
  const sets: T[][] = [];
  for await (const { rows } of resultSets) {
    const set: T[] = [];
    for await (const row of rows) {
      set.push(row as T);
    };
    sets.push(set);
  }
  return sets;
}
export let driver: Driver;
export async function initDb() {
  if (driver) return;
  logger.debug('Driver initializing...');

    const saKeyFile = process.env.SA_KEY_FILE;
	  const saCredentials = getSACredentialsFromJson('./' + saKeyFile);
	const authService = new IamAuthService(saCredentials);
	
	driver = new Driver({
		endpoint: process.env.ENDPOINT,
		database: process.env.DATABASE,
		authService
	});
  const timeout = 10000;
  if (!(await driver.ready(timeout))) {
    logger.error(`Driver has not become ready in ${timeout}ms!`);
    process.exit(1);
  }
	logger.debug('Driver ready');
	await createTables();
	
}

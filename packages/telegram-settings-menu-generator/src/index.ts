#!/usr/bin/env node

import * as tsj from 'ts-json-schema-generator';
import minimist from 'minimist';
import fs from 'fs';
let { path, to } = minimist(process.argv.slice(2)) as unknown as { path: string, to?: string };
to = to || path.replace(/.ts$/,'.json')
const config:tsj.Config = {
	path,
    tsconfig: "./tsconfig.json",
	type: "*",
	extraTags: [
		'roles',
		'default',
		'condition',
		'en',
		'ru',
		'sr',
		'uk',
		'pl'
    ],
}
const schema = tsj.createGenerator(config).createSchema(config.type);
fs.writeFileSync( to, JSON.stringify(schema, null, 2));
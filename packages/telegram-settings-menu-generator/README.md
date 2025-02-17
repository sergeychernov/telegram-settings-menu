# Telegram Settings Menu Generator

A command-line tool to generate a JSON schema from TypeScript interfaces for use with `telegram-settings-menu`.

## Installation

Install globally using npm or yarn:

```sh
npm install -g telegram-settings-menu-generator
```

or

```sh
yarn global add telegram-settings-menu-generator
```

## Usage

Run the generator by specifying the path to a TypeScript file containing the settings interface:

```sh
telegram-settings-menu-generator --path=./settings.ts --to=./settings.json
```

### Options

| Option  | Description |
|---------|-------------|
| `--path` | Path to the TypeScript file containing the settings interface. |
| `--to`   | (Optional) Path where the generated JSON schema should be saved. Defaults to replacing `.ts` with `.json`. |

## Example

Given a TypeScript file `settings.ts`:

```ts
interface Settings {
  language: string;
  notifications: boolean;
}
```

Running the generator:

```sh
telegram-settings-menu-generator --path=settings.ts
```

Will produce `settings.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "language": {
      "type": "string"
    },
    "notifications": {
      "type": "boolean"
    }
  },
  "required": ["language", "notifications"]
}
```

## License

This project is licensed under the MIT License.


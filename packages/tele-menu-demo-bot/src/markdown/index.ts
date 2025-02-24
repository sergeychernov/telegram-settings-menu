const SPECIAL_CHARS = [
	'\\',
	'_',
	//'*',
	'[',
	']',
	'(',
	')',
	'~',
	'`',
	'>',
	'<',
	'&',
	'#',
	'+',
	'-',
	'=',
	'|',
	'{',
	'}',
	'.',
	'!'
  ]
  export function escapeMarkdown(text: string){
	SPECIAL_CHARS.forEach(char => (text = text.replaceAll(char, `\\${char}`)))
	return text
  }
import { Context } from "telegraf";

export function getLocalizedText(key: string, context: Context): string {
    const translations = {
        en: {
            up: 'Up',
            back: 'Back',
            // Add other English translations as needed
        },
        ru: {
            up: 'Наверх',
            back: 'Назад',
            // Add other Russian translations as needed
        },
        sr: { // Serbian
            up: 'Gore',
            back: 'Nazad',
            // Add other Serbian translations as needed
        },
        uk: { // Ukrainian
            up: 'Вгору',
            back: 'Назад',
            // Add other Ukrainian translations as needed
        },
        // Add more languages as needed
    };

    const languageCode = context.from?.language_code;
    const language = languageCode && translations[languageCode] ? languageCode : 'en'; // Default to English
    return translations[language]?.[key] || key; // Fallback to the key if translation is missing

}
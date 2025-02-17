/**
 * @title Настройки
 */
export type Settings = {
	/**
     * @title Подписка на новости
     */
	subscriptionToNews?: boolean;

	/**
	 * @default 'Ежедневно'
	 * @title Период
	 * @format inline
	 */
	period: 'Ежеминутно' | 'Ежечасно' | 'Ежедневно';

	/**
	 * @title Boolean
	 */
	boolean: {
		/**
		 * @title Без Default
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
}
/**
 * @title Settings
 */
export type Settings = {
	/**
     * @title News Subscription
     */
	subscriptionToNews?: boolean;

	/**
	 * @default 'Daily'
	 * @title Period
	 * @format inline
	 * @condition {subscriptionToNews:true}
	 */
	period: 'Minutely' | 'Hourly' | 'Daily';

	/**
	 * @title Boolean Options
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
}
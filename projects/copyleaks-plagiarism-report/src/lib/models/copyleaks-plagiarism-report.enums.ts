/**
 * Enum for all the copyleaks report layouts types.
 */
export enum ReportLayoutType {
	/**
	 * One to one layout/view: when two documents are compared to each other.
	 */
	OneToOne = 'one-to-one',
	/**
	 * One to many layout/view: The default report layout, which shows the document along with the results section.
	 */
	OneToMany = 'one-to-many',
}

/**
 * Enum for all the copyleaks report responsive views types.
 */
export enum ResponsiveLayoutType {
	/**
	 * Desktop view.
	 */
	Desktop = 'desktop',
	/**
	 * Tablet view.
	 */
	Tablet = 'tablet',
	/**
	 * Mobile view.
	 */
	Mobile = 'mobile',
}

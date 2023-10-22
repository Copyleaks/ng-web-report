import { TemplateRef } from '@angular/core';

/**
 * Model for all the copyleaks report custom components references.
 */
export interface ICustomClsReportTemplatesRefs {
	/**
	 * @property {TemplateRef<any> | undefined} customActionsTemplate - Custom report actions section reference.
	 */
	customActionsTemplate: TemplateRef<any> | undefined;
	/**
	 * @property {TemplateRef<any> | undefined} customResultsTemplate - Custom report results section reference.
	 */
	customResultsTemplate: TemplateRef<any> | undefined;

	/**
	 * @property {ICustomClsReportTabTemplatesRefs[] | undefined} customResultsTemplate - Custom report tabs section references.
	 */
	customTabsTemplates: ICustomClsReportTabTemplatesRefs[] | undefined;
}

export interface ICustomClsReportTabTemplatesRefs {
	/**
	 * @property {TemplateRef<any> | undefined} customTabTitleTemplates - Custom report tab title reference.
	 */
	customTabTitleTemplates: TemplateRef<any> | undefined;

	/**
	 * @property {TemplateRef<any> | undefined} customTabContentTemplates - Custom report tab content reference.
	 */
	customTabContentTemplates: TemplateRef<any> | undefined;
}

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
	 * @property {TemplateRef<any> | undefined} customResultsTemplate - Custom report resultws section reference.
	 */
	customResultsTemplate: TemplateRef<any> | undefined;
}

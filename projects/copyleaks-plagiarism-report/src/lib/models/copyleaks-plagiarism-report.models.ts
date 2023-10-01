import { TemplateRef } from '@angular/core';

/**
 * Model for all the copyleaks report custom components references.
 */
export interface ICustomClsReportTemplatesRefs {
	/**
	 * Custom report actions section reference.
	 */
	customActionsTemplate: TemplateRef<any> | undefined;
	/**
	 * Custom report resultws section reference.
	 */
	customResultsTemplate: TemplateRef<any> | undefined;
}

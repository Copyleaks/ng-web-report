import { TemplateRef } from '@angular/core';
import { IResultItem } from '../components/containers/report-results-item-container/components/models/report-result-item.models';

/**
 * Model for all the copyleaks report custom components references.
 */
export interface ICustomClsReportTemplatesRefs {
	/**
	 * @property {TemplateRef<any> | undefined} customActionsTemplate - Custom report actions section reference.
	 */
	customActionsTemplate: TemplateRef<any> | undefined;

	/**
	 * @property {TemplateRef<any> | undefined} customEmptyResultsTemplate - Custom empty report results section reference.
	 */
	customEmptyResultsTemplate: TemplateRef<any> | undefined;

	/**
	 * @property {TemplateRef<any> | undefined} customResultsTemplate - Custom report results section reference.
	 */
	customResultsTemplate: TemplateRef<any> | undefined;

	/**
	 * @property {ICustomClsReportTabTemplatesRefs[] | undefined} customResultsTemplate - Custom report tabs section references.
	 */
	customTabsTemplates: ICustomClsReportTabTemplatesRefs[] | undefined;

	/**
	 * @property {TemplateRef<IResultItem> | undefined} lockedResultItemTemplateRef - Custom locked result item section references.
	 */
	lockedResultItemTemplateRef: TemplateRef<IResultItem> | undefined;
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

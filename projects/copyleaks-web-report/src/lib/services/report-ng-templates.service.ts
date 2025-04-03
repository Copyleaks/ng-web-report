import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ECustomResultsReportView } from '../components/core/cr-custom-results/models/cr-custom-results.enums';
import { ICustomClsReportTabTemplatesRefs, ICustomClsReportTemplatesRefs } from '../models/report-ng-templates.models';
import { IResultItem } from '../components/containers/report-results-item-container/components/models/report-result-item.models';

@Injectable()
export class ReportNgTemplatesService {
	private _reportTemplatesRefs$ = new BehaviorSubject<ICustomClsReportTemplatesRefs | undefined>(undefined);
	/**
	 * Subject for sharing the report custom components references in the report library.
	 */
	public get reportTemplatesSubject$() {
		return this._reportTemplatesRefs$;
	}
	/**
	 * Getter for the report custom components references in the report library.
	 */
	public get reportTemplatesRefs() {
		return this._reportTemplatesRefs$.value;
	}

	private _reportTemplatesMode$ = new BehaviorSubject<ECustomResultsReportView | undefined>(undefined);
	/**
	 * Subject for sharing the report custom components references in the report library.
	 */
	public get reportTemplatesMode$() {
		return this._reportTemplatesMode$;
	}

	/**
	 * Setter for the custom report actions section template reference.
	 */
	public setReportCustomActionsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customActionsTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report results section template reference.
	 */
	public setReportCustomEmptyResultsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customEmptyResultsTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report results section template reference.
	 */
	public setReportCustomTabsTemplateRef(templates: ICustomClsReportTabTemplatesRefs[]) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customTabsTemplates: templates,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report results section template reference.
	 */
	public setReportCustomResultsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customResultsTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report banner section references
	 */
	public setReportCustomBannerSectionTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customBannerSectionTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report custom AI source match upgrade component references
	 */
	public setReportCustomAISourceMatchUpgradeTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			customAISourceMatchUpgradeTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report results section template reference.
	 */
	public setLockedResultItemTemplateRef(template: TemplateRef<IResultItem>) {
		this._reportTemplatesRefs$.next({
			...this._reportTemplatesRefs$.value,
			lockedResultItemTemplateRef: template,
		} as ICustomClsReportTemplatesRefs);
	}
}

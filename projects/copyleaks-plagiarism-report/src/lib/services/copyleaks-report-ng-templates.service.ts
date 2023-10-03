import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICustomClsReportTemplatesRefs } from '../models/copyleaks-report-ng-templates.models';

@Injectable()
export class CopyleaksReportNgTemplatesService {
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

	/**
	 * Setter for the custom report actions section template reference.
	 */
	public setReportCustomActionsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			customActionsTemplate: template,
			customResultsTemplate: this.reportTemplatesRefs?.customResultsTemplate,
		} as ICustomClsReportTemplatesRefs);
	}

	/**
	 * Setter for the custom report results section template reference.
	 */
	public setReportCustomResultsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			customActionsTemplate: this.reportTemplatesRefs?.customActionsTemplate,
			customResultsTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}
}

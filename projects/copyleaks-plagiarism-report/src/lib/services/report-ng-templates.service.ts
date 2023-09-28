import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICustomClsReportTemplatesRefs } from '../models/copyleaks-plagiarism-report.models';

@Injectable()
export class ReportNgTemplatesService {
	private _reportTemplatesRefs$ = new BehaviorSubject<ICustomClsReportTemplatesRefs | undefined>(undefined);
	public get reportTemplatesSubject$() {
		return this._reportTemplatesRefs$;
	}
	public get reportTemplatesRefs() {
		return this._reportTemplatesRefs$.value;
	}

	public setReportCustomActionsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			customActionsTemplate: template,
			customResultsTemplate: this.reportTemplatesRefs?.customResultsTemplate,
		} as ICustomClsReportTemplatesRefs);
	}

	public setReportCustomResultsTemplateRef(template: TemplateRef<any>) {
		this._reportTemplatesRefs$.next({
			customActionsTemplate: this.reportTemplatesRefs?.customResultsTemplate,
			customResultsTemplate: template,
		} as ICustomClsReportTemplatesRefs);
	}
}

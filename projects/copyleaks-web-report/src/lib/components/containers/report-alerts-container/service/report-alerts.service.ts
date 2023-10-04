import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ReportAlertsService {
	private _showAlertPreview$ = new BehaviorSubject<boolean>(false);

	get showAlertPreview$() {
		return this._showAlertPreview$;
	}

	setShowAlertPreview$(result: boolean) {
		this._showAlertPreview$.next(result);
	}

	constructor() {}
}

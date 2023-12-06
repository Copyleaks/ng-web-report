import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ResultPreview } from '../models/report-data.models';

@Injectable()
export class ReportRealtimeResultsService {
	private _onNewResults$ = new Subject<ResultPreview[]>();

	/** Emits matches that are relevant to source html one-to-many mode */
	public get onNewResults$() {
		return this._onNewResults$;
	}

	/**
	 * Function that adds new results to the report real-time view,
	 * these result will be added to the already existing results & will be available for one-to-one view
	 * @param newResults List of new results for real time view
	 */
	public pushNewResults(newResults: ResultPreview[]): void {
		this._onNewResults$.next(newResults);
	}

	ngOnDestroy(): void {}
}

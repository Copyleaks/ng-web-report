import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IResourceStartExplainableAIVideo } from '../models/report-ai-results.models';

@Injectable()
export class ReportAIResultsService {
	private _resourcesStartExplainableAIVideo$ = new BehaviorSubject<IResourceStartExplainableAIVideo | null>(null);
	/** Subject for sharing the report reposive view mode. */
	public get resourcesStartExplainableVideo$() {
		return this._resourcesStartExplainableAIVideo$;
	}
	public get resourcesStartExplainableVideo() {
		return this._resourcesStartExplainableAIVideo$.value;
	}

	constructor() {}

	ngOnDestroy(): void {}
}

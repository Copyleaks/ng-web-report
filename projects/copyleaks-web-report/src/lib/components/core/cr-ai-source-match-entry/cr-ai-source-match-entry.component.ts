import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'cr-ai-source-match-entry',
	templateUrl: './cr-ai-source-match-entry.component.html',
	styleUrls: ['./cr-ai-source-match-entry.component.scss'],
})
export class CrAiSourceMatchEntryComponent implements OnInit {
	@Input() aiSourceMatchResultsScore: number = 0;
	@Input() aiSourceMatchResultsIndenticalScore: number = 0;
	@Input() aiSourceMatchResultsMinorChangesScore: number = 0;
	@Input() aiSourceMatchResultsParaphrasedScore: number = 0;
	@Input() aiSourceMatchResultsTotal: number = 0;

	@Output() onNavigateToResults = new EventEmitter<void>();

	constructor() {}

	ngOnInit(): void {}

	onNavigateToResultsClick() {
		this.onNavigateToResults.emit();
	}
}

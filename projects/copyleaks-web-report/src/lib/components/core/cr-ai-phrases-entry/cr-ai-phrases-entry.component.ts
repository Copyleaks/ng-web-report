import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReportViewService } from '../../../services/report-view.service';

@Component({
	selector: 'cr-ai-phrases-entry',
	templateUrl: './cr-ai-phrases-entry.component.html',
	styleUrls: ['./cr-ai-phrases-entry.component.scss'],
})
export class CrAiPhrasesEntryComponent implements OnInit {
	@Input() barTooltipText: string = '';
	@Input() minProportion: number = 0;
	@Input() maxProportion: number = 0;
	@Input() minGradeBar: number = 0;
	@Input() maxGradeBar: number = 0;
	@Input() midGradeBar: number = 0;
	@Input() hasInfinityResult: boolean = false;
	@Input() totalPhrases: number = 0;
	@Input() isLoading: boolean = true;

	/**
	 * @Input {number} The AI percentage result
	 */
	@Input() aiPercentageResult: number = 0;

	@Output() onNavigateToPhrases = new EventEmitter<void>();

	constructor(public reportViewSvc: ReportViewService) {}

	ngOnInit(): void {}

	onNavigateToPhrasesClick() {
		this.onNavigateToPhrases.emit();
	}
}

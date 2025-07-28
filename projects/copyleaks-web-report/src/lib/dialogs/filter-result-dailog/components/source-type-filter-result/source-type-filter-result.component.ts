import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ITotalSourceType } from './models/source-type-filter-result.models';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';
import { ReportViewService } from '../../../../services/report-view.service';
import { EPlatformType } from '../../../../enums/copyleaks-web-report.enums';
import { untilDestroy } from '../../../../utils/until-destroy';
import { ReportDataService } from '../../../../services/report-data.service';

@Component({
	selector: 'cr-source-type-filter-result',
	templateUrl: './source-type-filter-result.component.html',
	styleUrls: ['./source-type-filter-result.component.scss'],
})
export class SourceTypeFilterResultComponent implements OnInit, OnDestroy {
	/**
	 * @Input {ITotalSourceType} Total counts of different source types in the report
	 */
	@Input() totalSourceType: ITotalSourceType = {
		totalInternet: 0,
		totalInternalDatabase: 0,
		totalbatch: 0,
		totalOthersFiles: 0,
		totalYourFiles: 0,
		totalAISourceMatch: 0,
	};

	/**
	 * @Input {ReportViewService} Service for managing the report view state and interactions
	 */
	@Input() reportViewSvc: ReportViewService;

	/**
	 * @Input {ReportDataService} Service for accessing and managing report data
	 */
	@Input() reportDataSvc: ReportDataService;

	eFilterResultForm = EFilterResultForm;
	ePlatformType = EPlatformType;

	INTERNET_SOURCE = $localize`Internet Source`;
	IINTERNAL_DATABASE = $localize`Shared Data Hub`;
	THIS_BACTCH = $localize`This batch`;
	AI_SOURCE_MATCH = $localize`AI Source Match`;
	AI_SOURCE_MATCH_TOOLTIP = $localize`AI Source Match blends plagiarism and AI detection to identify reused or repurposed AI-generated content from other sources.`;

	platformType: EPlatformType;

	get repositoriesForm() {
		return this.filterService.sourceTypeFormGroup?.get(EFilterResultForm.fgRepositories) as UntypedFormGroup;
	}

	get repositoryLength() {
		return this.totalSourceType?.repository?.length || 0;
	}

	constructor(public filterService: FilterResultDailogService) {}

	ngOnInit(): void {
		if (this.totalSourceType?.repository) {
			this.totalSourceType?.repository.forEach(repo => {
				this.addRepositoryControl(repo.id);
			});
		}

		if (this.reportViewSvc) {
			this.platformType = this.reportViewSvc.reportViewMode.platformType;
			this.reportViewSvc.reportViewMode$.pipe(untilDestroy(this)).subscribe(data => {
				if (!data) return;
				this.platformType = data.platformType;
			});
		}
	}

	addRepositoryControl(repoId: string) {
		const repositories = this.repositoriesForm;
		repositories.addControl(repoId, new UntypedFormControl(this.filterService.getRepositoryValueById()));
	}

	ngOnDestroy(): void {}
}

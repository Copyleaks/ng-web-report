import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ITotalSourceType } from './models/source-type-filter-result.models';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { EFilterResultForm } from '../../models/filter-result-dailog.enum';

@Component({
	selector: 'cr-source-type-filter-result',
	templateUrl: './source-type-filter-result.component.html',
	styleUrls: ['./source-type-filter-result.component.scss'],
})
export class SourceTypeFilterResultComponent implements OnInit {
	@Input() totalSourceType: ITotalSourceType = {
		totalInternet: 0,
		totalInternalDatabase: 0,
		totalbatch: 0,
		totalOthersFiles: 0,
		totalYourFiles: 0,
	};

	eFilterResultForm = EFilterResultForm;

	INTERNET_SOURCE = $localize`Internet Source`;
	IINTERNAL_DATABASE = $localize`Internal Database`;
	THIS_BACTCH = $localize`This batch`;

	get repositoriesForm() {
		return this.filterService.sourceTypeFormGroup?.get(EFilterResultForm.fgRepositories) as FormGroup;
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
	}

	addRepositoryControl(repoId: string) {
		const repositories = this.repositoriesForm;
		repositories.addControl(repoId, new FormControl(this.filterService.getRepositoryValueById()));
	}
}

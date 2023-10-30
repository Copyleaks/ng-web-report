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
	};

	surceTypeForm: FormGroup;
	eFilterResultForm = EFilterResultForm;
	get repositoriesForm() {
		return this.surceTypeForm?.get(EFilterResultForm.fgRepositories) as FormGroup;
	}

	get repositoryLength() {
		return this.totalSourceType?.repository?.length || 0;
	}

	constructor(private filterService: FilterResultDailogService) {}

	ngOnInit(): void {
		this.surceTypeForm = this.filterService.sourceTypeFormGroup;

		if (this.totalSourceType?.repository) {
			this.totalSourceType?.repository.forEach(repo => {
				this.addRepositoryControl(repo.id);
			});
		}
	}

	addRepositoryControl(repoId: string) {
		const repositories = this.repositoriesForm;
		repositories.addControl(repoId, new FormControl(this.filterService.getRepositoryValueById(repoId)));
	}
}

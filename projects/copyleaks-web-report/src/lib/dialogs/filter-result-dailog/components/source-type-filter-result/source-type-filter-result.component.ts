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
	surceTypeForm: FormGroup;
	eFilterResultForm = EFilterResultForm;

	@Input() loading: boolean;
	@Input() totalSourceType: ITotalSourceType = {
		totalInternet: 0,
		totalInternalDatabase: 0,
		totalbatch: 0,
	};

	get repositoriesForm() {
		return this.surceTypeForm.get('repositories') as FormGroup;
	}

	get repositoryLength() {
		return this.totalSourceType?.repository?.length || 0;
	}

	constructor(private filterService: FilterResultDailogService) {}

	ngOnInit(): void {
		this.surceTypeForm = this.filterService.sourceTypeFormGroup;

		// if (this.totalSourceType?.repository) {
		// 	this.totalSourceType?.repository.forEach(repo => {
		// 		this.addRepositoryControl(repo);
		// 	});
		// }
	}

	addRepositoryControl(repo: any) {
		const repositories = this.repositoriesForm;
		repositories.addControl(repo.name, new FormControl(false));
	}
}

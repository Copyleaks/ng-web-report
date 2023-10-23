import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EResultPreviewType } from 'projects/copyleaks-web-report/src/lib/enums/copyleaks-web-report.enums';
import { TotalSourceType } from './models/source-type-filter-result.models';

@Component({
	selector: 'cr-source-type-filter-result',
	templateUrl: './source-type-filter-result.component.html',
	styleUrls: ['./source-type-filter-result.component.scss'],
})
export class SourceTypeFilterResultComponent implements OnInit {
	surceTypeForm: FormGroup;
	eResultPreviewType = EResultPreviewType;

	totalSourceType: TotalSourceType = {
		totalInternet: 3,
		totalInternalDatabase: 3,
		totalbatch: 3,
		repository: ['rep1'],
	};

	get repositoriesForm() {
		return this.surceTypeForm.get('repositories') as FormGroup;
	}

	get internetValue() {
		return this.surceTypeForm.get('internet')?.value;
	}
	get internetForm() {
		return this.surceTypeForm.get('internet') as FormControl;
	}

	constructor(private _formBuilder: FormBuilder) {}

	ngOnInit(): void {
		this.surceTypeForm = this._formBuilder.group({
			internet: new FormControl(true),
			database: new FormControl(true),
			batch: new FormControl(false),
			repositories: this._formBuilder.group([]),
		});

		if (this.totalSourceType?.repository) {
			this.totalSourceType?.repository.forEach(repo => {
				this.addRepositoryControl(repo);
			});
		}
	}

	addRepositoryControl(controlName: string) {
		const repositories = this.repositoriesForm;
		repositories.addControl(controlName, new FormControl(false));
	}
}

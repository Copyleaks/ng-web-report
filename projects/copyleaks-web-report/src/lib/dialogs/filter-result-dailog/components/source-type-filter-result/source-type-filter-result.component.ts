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
	surceType: FormGroup;
	eResultPreviewType = EResultPreviewType;
	constructor(private _formBuilder: FormBuilder) {}

	totalSourceType: TotalSourceType = {
		totalInternet: 3,
		totalInternalDatabase: 3,
		totalbatch: 3,
		repository: ['rep1'],
	};

	ngOnInit(): void {
		this.surceType = this._formBuilder.group({
			internet: new FormControl(''),
			database: new FormControl(''),
			batch: new FormControl(''),
			repositories: this._formBuilder.array([]),
		});
	}
}

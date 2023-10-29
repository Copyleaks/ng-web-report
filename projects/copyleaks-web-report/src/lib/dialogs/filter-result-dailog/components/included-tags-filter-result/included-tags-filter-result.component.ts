import { Component, Input, OnInit } from '@angular/core';
import { ITagItem } from './models/included-tags-filter-result.models';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { untilDestroy } from 'projects/copyleaks-web-report/src/lib/utils/until-destroy';
import { Observable } from 'rxjs';

@Component({
	selector: 'cr-included-tags-filter-result',
	templateUrl: './included-tags-filter-result.component.html',
	styleUrls: ['./included-tags-filter-result.component.scss'],
})
export class IncludedTagsFilterResultComponent implements OnInit {
	@Input() allTagItem: ITagItem[];

	includedTagsForm: FormControl;
	filteredTagList: Observable<ITagItem[]>;
	searchTagControl = new FormControl('');
	showMoreMenu: boolean = false;

	get includedTagsFormValue() {
		return this.includedTagsForm.value as ITagItem[];
	}

	get selectedList() {
		return this.includedTagsFormValue.map(item => item.title);
	}

	get searchValue() {
		return this.searchTagControl.value;
	}

	constructor(private filterService: FilterResultDailogService) {}
	ngOnInit(): void {
		this.includedTagsForm = this.filterService.includedTagsFormControl;

		this.updateSelectedTag();

		this.filteredTagList = this.searchTagControl.valueChanges.pipe(
			untilDestroy(this),
			startWith(''),
			map(value => this._filterTags(value || ''))
		);
	}

	updateSelectedTag() {
		this.includedTagsFormValue.forEach(item => {
			const tag = this.allTagItem.find(tag => tag.code == item.code);
			if (tag) {
				tag.selected = true;
			}
		});
	}

	selectTag() {
		this.includedTagsForm.setValue(this.allTagItem.filter(tag => tag.selected));
	}

	private _filterTags(value: string) {
		return this.allTagItem.filter(tag => tag.title.toLowerCase().includes(value.toLowerCase()));
	}

	clearSearch() {
		this.searchTagControl.setValue('');
	}
	ngOnDestroy() {}
}

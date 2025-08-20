import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITagItem } from './models/included-tags-filter-result.models';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { UntypedFormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { untilDestroy } from '../../../../utils/until-destroy';
import { Observable } from 'rxjs';

@Component({
    selector: 'cr-included-tags-filter-result',
    templateUrl: './included-tags-filter-result.component.html',
    styleUrls: ['./included-tags-filter-result.component.scss'],
    standalone: false
})
export class IncludedTagsFilterResultComponent implements OnInit, OnChanges {
	/**
	 * @Input {ITagItem[]} List of all tag items available for display or selection
	 */
	@Input() allTagItem: ITagItem[];

	includedTagsForm: UntypedFormControl;
	filteredTagList: Observable<ITagItem[]>;
	searchTagControl = new UntypedFormControl('');
	showMoreMenu: boolean = false;

	get includedTagsFormValue() {
		return this.includedTagsForm.value as ITagItem[];
	}

	get selectedList() {
		return this.allTagItem.filter(item => item.selected).map(item => item.title);
	}

	get searchValue() {
		return this.searchTagControl.value;
	}

	EXPEND_TOOLTIP = $localize`Expand`;
	COLLAPSE_TOOLTIP = $localize`Collapse`;

	constructor(private _filterService: FilterResultDailogService) {}

	ngOnInit(): void {
		this.isSearchInputDisabled();
		this.includedTagsForm = this._filterService.includedTagsFormControl;

		this.filteredTagList = this.searchTagControl.valueChanges.pipe(
			untilDestroy(this),
			startWith(''),
			map(value => this._filterTags(value || ''))
		);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['allTagItem'])
			this.filteredTagList = this.searchTagControl.valueChanges.pipe(
				untilDestroy(this),
				startWith(''),
				map(value => this._filterTags(value || ''))
			);
	}

	selectTag() {
		this.includedTagsForm.setValue(this.allTagItem.filter(tag => tag.selected));
		this.showMoreMenu = true;
	}

	private _filterTags(value: string) {
		return this.allTagItem.filter(tag => tag.title.toLowerCase().includes(value.toLowerCase()));
	}

	clearSearch() {
		this.searchTagControl.setValue('');
	}

	isSearchInputDisabled() {
		if (!this.allTagItem || this.allTagItem.length === 0) this.searchTagControl.disable();
	}

	ngOnDestroy() {}
}

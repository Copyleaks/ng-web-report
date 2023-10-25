import { Component, Input, OnInit } from '@angular/core';
import { ITagItem } from './models/included-tags-filter-result.models';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'cr-included-tags-filter-result',
	templateUrl: './included-tags-filter-result.component.html',
	styleUrls: ['./included-tags-filter-result.component.scss'],
})
export class IncludedTagsFilterResultComponent implements OnInit {
	@Input() allTagItem: ITagItem[] = [
		{
			code: '0',
			title: 'Menu item1',
			description: 'string',
		},
		{
			code: '1',
			title: 'Menu item2',
			description: 'string',
		},
		{
			code: '2',
			title: 'Menu item12',
			description: 'string',
		},
		{
			code: '3',
			title: 'Menu item13',
			description: 'string',
		},
		{
			code: '4',
			title: 'Menu item14',
			description: 'string',
		},
		{
			code: '5',
			title: 'Menu item15',
			description: 'string',
		},
	];
	listTagItem: ITagItem[];

	includedTagsForm: FormControl;
	selectedTag: ITagItem[] = [];
	showMoreMenu: boolean = false;
	searchInput: string = '';

	get selectedList() {
		return (this.includedTagsForm.value as ITagItem[]).map(item => item.title);
	}

	constructor(private filterService: FilterResultDailogService) {}
	ngOnInit(): void {
		this.includedTagsForm = this.filterService.IncludedTagsFormControl;

		this.listTagItem = this.allTagItem;
	}

	searchButton() {}

	selectTag(item: ITagItem) {
		item.selected = !item.selected;
	}

	onSearchInputEnter() {}
}

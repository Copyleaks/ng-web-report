import { Component, Input, OnInit } from '@angular/core';
import { ITagItem } from './models/included-tags-filter-result.models';

@Component({
	selector: 'cr-included-tags-filter-result',
	templateUrl: './included-tags-filter-result.component.html',
	styleUrls: ['./included-tags-filter-result.component.scss'],
})
export class IncludedTagsFilterResultComponent implements OnInit {
	@Input() allTagItem: ITagItem[] = [
		{
			tagName: 'Menu item1',
			selected: true,
		},
		{
			tagName: 'Menu item2',
			selected: true,
		},
		{
			tagName: 'Menu item3',
			selected: false,
		},
		{
			tagName: 'Menu item4',
			selected: false,
		},
		{
			tagName: 'Menu item5',
			selected: false,
		},
		{
			tagName: 'Menu item6',
			selected: false,
		},

		{
			tagName: 'Menu item7',
			selected: false,
		},
		{
			tagName: 'Menu item11',
			selected: false,
		},
		{
			tagName: 'Menu item12',
			selected: false,
		},
		{
			tagName: 'Menu item13',
			selected: false,
		},
		{
			tagName: 'Menu item14',
			selected: false,
		},
		{
			tagName: 'Menu item15',
			selected: false,
		},
		{
			tagName: 'Menu item16',
			selected: false,
		},

		{
			tagName: 'Menu item17',
			selected: false,
		},
	];

	listTagItem: ITagItem[];
	showMoreMenu: boolean = false;
	searchInput: string = '';
	get selectedList() {
		return this.allTagItem.filter(item => item.selected).map(item => item.tagName);
	}

	constructor() {}
	ngOnInit(): void {
		this.listTagItem = this.allTagItem;
	}

	searchButton() {}

	selectTag(item: ITagItem) {
		item.selected = !item.selected;
	}

	onSearchInputEnter() {}
}

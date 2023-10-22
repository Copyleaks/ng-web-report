import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'cr-filter-result-dailog',
	templateUrl: './filter-result-dailog.component.html',
	styleUrls: ['./filter-result-dailog.component.scss'],
})
export class FilterResultDailogComponent implements OnInit {
	ilterResultForm: FormGroup;
	constructor() {}

	surceTypeList: string[] = ['Internet Source', 'Internal Database', '{repository1 name}', 'This batch'];
	selectedTags: string[] = ['.png', '.web', '.png', '.web', '.png', '.web', '.png', '.web'];
	//Results meta
	///Result word limit
	limitWord: boolean = false;
	wordLimit: number = 0;
	minWordLimit: number = 0;
	maxWordLimit: number = 1023;

	//show more menu item
	showMoreMenu: boolean = true;
	ngOnInit(): void {}
}

import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { ICustomClsReportTabTemplatesRefs } from '../../../models/report-ng-templates.models';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { CrCustomTabItemComponent } from './components/cr-custom-tab-item/cr-custom-tab-item.component';

@Component({
	selector: 'cr-custom-tabs',
	templateUrl: './cr-custom-tabs.component.html',
	styleUrls: ['./cr-custom-tabs.component.scss'],
	standalone: false,
})
export class CrCustomTabsComponent implements OnInit {
	@ContentChildren(CrCustomTabItemComponent) tabItems: QueryList<CrCustomTabItemComponent>;

	templateRefsArray: ICustomClsReportTabTemplatesRefs[] = [];

	ngAfterContentInit() {
		this.tabItems.forEach(tabItem => {
			this.templateRefsArray.push({
				customTabTitleTemplates: tabItem.tabTemplateTitle,
				customTabContentTemplates: tabItem.tabTemplateContent,
			} as ICustomClsReportTabTemplatesRefs);
		});

		if (this.templateRefsArray.length > 0)
			this._reportTemplateRefsSvc.setReportCustomTabsTemplateRef(this.templateRefsArray);
	}
	constructor(private _reportTemplateRefsSvc: ReportNgTemplatesService) {}

	ngOnInit(): void {}
}

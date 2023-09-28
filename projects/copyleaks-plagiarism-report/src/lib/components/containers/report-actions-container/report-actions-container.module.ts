import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportActionsContainerComponent } from './report-actions-container.component';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';

@NgModule({
	declarations: [ReportActionsContainerComponent],
	imports: [CommonModule],
	exports: [ReportActionsContainerComponent],
	providers: [ReportNgTemplatesService],
})
export class ReportActionsContainerModule {}

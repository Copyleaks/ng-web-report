import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportActionsContainerComponent } from './report-actions-container.component';
import { CopyleaksReportNgTemplatesService } from '../../../services/copyleaks-report-ng-templates.service';

@NgModule({
	declarations: [ReportActionsContainerComponent],
	imports: [CommonModule],
	exports: [ReportActionsContainerComponent],
	providers: [CopyleaksReportNgTemplatesService],
})
export class ReportActionsContainerModule {}

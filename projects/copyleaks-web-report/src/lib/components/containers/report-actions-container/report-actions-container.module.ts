import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportActionsContainerComponent } from './report-actions-container.component';
import { ReportNgTemplatesService } from '../../../services/report-ng-templates.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
	declarations: [ReportActionsContainerComponent],
	imports: [CommonModule, NgxSkeletonLoaderModule],
	exports: [ReportActionsContainerComponent],
	providers: [ReportNgTemplatesService],
})
export class ReportActionsContainerModule {}

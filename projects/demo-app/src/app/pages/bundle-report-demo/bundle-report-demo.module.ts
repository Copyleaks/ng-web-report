import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BundleReportDemoComponent } from './bundle-report-demo.component';
import { BundleReportDemoRoutingModule } from './bundle-report-demo-routing.module';

@NgModule({
	declarations: [BundleReportDemoComponent],
	imports: [CommonModule, BundleReportDemoRoutingModule],
})
export class BundleReportDemoModule {}

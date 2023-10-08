import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { OneToManyReportLayoutDesktopModule } from './components/layouts/one-to-many-report-layout-desktop/one-to-many-report-layout-desktop.module';
import { OneToManyReportLayoutMobileModule } from './components/layouts/one-to-many-report-layout-mobile/one-to-many-report-layout-mobile.module';
import { OneToOneReportLayoutModule } from './components/layouts/one-to-one-report-layout-desktop/one-to-one-report-layout-desktop.module';
import { OneToOneReportLayoutMobileModule } from './components/layouts/one-to-one-report-layout-mobile/one-to-one-report-layout-mobile.module';
import { CopyleaksWebReportComponent } from './copyleaks-web-report.component';

@NgModule({
	declarations: [CopyleaksWebReportComponent],
	imports: [
		CommonModule,
		HttpClientModule,
		OneToOneReportLayoutMobileModule,
		OneToOneReportLayoutModule,
		OneToManyReportLayoutMobileModule,
		OneToManyReportLayoutDesktopModule,
	],
	exports: [CopyleaksWebReportComponent],
})
export class CopyleaksWebReportModule {}

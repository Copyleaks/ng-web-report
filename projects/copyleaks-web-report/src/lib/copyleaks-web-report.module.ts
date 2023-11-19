import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CrActionsComponent } from './components/core/cr-report-actions/cr-actions.component';
import { OneToManyReportLayoutDesktopModule } from './components/layouts/one-to-many/one-to-many-report-layout-desktop/one-to-many-report-layout-desktop.module';
import { OneToManyReportLayoutMobileModule } from './components/layouts/one-to-many/one-to-many-report-layout-mobile/one-to-many-report-layout-mobile.module';
import { OneToOneReportLayoutModule } from './components/layouts/one-to-one/one-to-one-report-layout-desktop/one-to-one-report-layout-desktop.module';
import { OneToOneReportLayoutMobileModule } from './components/layouts/one-to-one/one-to-one-report-layout-mobile/one-to-one-report-layout-mobile.module';
import { OnlyAiReportLayoutDesktopModule } from './components/layouts/only-ai/only-ai-report-layout-desktop/only-ai-report-layout-desktop.module';
import { OnlyAiReportLayoutMobileModule } from './components/layouts/only-ai/only-ai-report-layout-mobile/only-ai-report-layout-mobile.module';
import { CopyleaksWebReportComponent } from './copyleaks-web-report.component';
import { HttpRequestErrorInterceptorProvider } from './pipes/http-request-error-pipe/http-request-error-pipe.pipe';
import { ReportErrorsService } from './services/report-errors.service';

@NgModule({
	declarations: [CopyleaksWebReportComponent, CrActionsComponent],
	imports: [
		CommonModule,
		HttpClientModule,
		OneToOneReportLayoutMobileModule,
		OneToOneReportLayoutModule,
		OneToManyReportLayoutMobileModule,
		OneToManyReportLayoutDesktopModule,
		OnlyAiReportLayoutDesktopModule,
		OnlyAiReportLayoutMobileModule,
	],
	exports: [CopyleaksWebReportComponent, CrActionsComponent],
	providers: [HttpRequestErrorInterceptorProvider, ReportErrorsService],
})
export class CopyleaksWebReportModule {}

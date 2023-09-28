import { NgModule } from '@angular/core';
import { CopyleaksPlagiarismReportComponent } from './copyleaks-plagiarism-report.component';
import { CommonModule } from '@angular/common';
import { OneToOneReportLayoutMobileModule } from './components/layouts/one-to-one-report-layout-mobile/one-to-one-report-layout-mobile.module';
import { OneToManyReportLayoutDesktopModule } from './components/layouts/one-to-many-report-layout-desktop/one-to-many-report-layout-desktop.module';
import { OneToManyReportLayoutMobileModule } from './components/layouts/one-to-many-report-layout-mobile/one-to-many-report-layout-mobile.module';
import { OneToOneReportLayoutModule } from './components/layouts/one-to-one-report-layout-desktop/one-to-one-report-layout-desktop.module';

@NgModule({
  declarations: [CopyleaksPlagiarismReportComponent],
  imports: [
    CommonModule,
    OneToOneReportLayoutMobileModule,
    OneToOneReportLayoutModule,
    OneToManyReportLayoutMobileModule,
    OneToManyReportLayoutDesktopModule,
  ],
  exports: [CopyleaksPlagiarismReportComponent],
})
export class CopyleaksPlagiarismReportModule {}

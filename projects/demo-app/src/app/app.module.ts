import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CopyleaksPlagiarismReportModule } from 'projects/copyleaks-plagiarism-report/src/lib/copyleaks-plagiarism-report.module';
// import { CopyleaksPlagiarismReportModule } from 'copyleaks-plagiarism-report';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CopyleaksPlagiarismReportModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

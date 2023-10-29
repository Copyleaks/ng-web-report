import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportAlertsContainerComponent } from './report-alerts-container.component';
import { AlertCardComponent } from './components/alert-card/alert-card.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatChipsModule } from '@angular/material/chips';
import { AuthorAlertCardComponent } from './components/author-alert-card/author-alert-card.component';
import { ReportViewService } from '../../../services/report-view.service';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';

@NgModule({
	declarations: [ReportAlertsContainerComponent, AlertCardComponent, AuthorAlertCardComponent],
	imports: [CommonModule, MatIconModule, MatChipsModule, FlexLayoutModule, MatButtonModule, MatExpansionModule],
	exports: [ReportAlertsContainerComponent, AlertCardComponent, AuthorAlertCardComponent],
	providers: [ReportViewService, ReportMatchHighlightService],
})
export class ReportAlertsContainerModule {}

import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'copyleaks-report-actions-container',
  templateUrl: './report-actions-container.component.html',
  styleUrls: ['./report-actions-container.component.scss'],
})
export class ReportActionsContainerComponent implements OnInit {
  @HostBinding('style.display')
  display = 'flex';

  @HostBinding('style.flex-grow')
  flexGrowProp: number;

  @Input() flexGrow: number;

  ngOnInit(): void {
    if (this.flexGrow !== undefined && this.flexGrow !== null)
      this.flexGrowProp = this.flexGrow;
  }

  hideReportActions() {
    this.display = 'none';
  }
}

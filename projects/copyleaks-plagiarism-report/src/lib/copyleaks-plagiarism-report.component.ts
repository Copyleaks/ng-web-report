import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ReportLayoutType,
  ResponsiveLayoutType,
} from './models/copyleaks-plagiarism-report.enums';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'copyleaks-plagiarism-report',
  templateUrl: './copyleaks-plagiarism-report.component.html',
  styleUrls: ['./copyleaks-plagiarism-report.component.scss'],
})
export class CopyleaksPlagiarismReportComponent implements OnInit, OnDestroy {
  @Input() reportLayoutType: ReportLayoutType = ReportLayoutType.OneToMany;
  @Input() responsiveLayoutType: ResponsiveLayoutType | null = null;

  // Layout realated properties
  ReportLayoutType = ReportLayoutType;
  ResponsiveLayoutType = ResponsiveLayoutType;
  layoutSub: any;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    if (this.responsiveLayoutType == null) this._initResponsiveLayoutType();
  }

  private _initResponsiveLayoutType() {
    const layoutChanges = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web,
      Breakpoints.Large,
      Breakpoints.XLarge,
      Breakpoints.TabletLandscape,
      Breakpoints.Medium,
      Breakpoints.Small,
      Breakpoints.XSmall,
      Breakpoints.HandsetPortrait,
      Breakpoints.HandsetLandscape,
      Breakpoints.TabletPortrait,
    ]);

    this.layoutSub = layoutChanges
      .pipe(
        map((result) => {
          if (result.matches) {
            if (
              result.breakpoints[Breakpoints.Web] ||
              result.breakpoints[Breakpoints.Large] ||
              result.breakpoints[Breakpoints.XLarge]
            ) {
              return ResponsiveLayoutType.Desktop;
            }
            if (
              result.breakpoints[Breakpoints.Tablet] ||
              result.breakpoints[Breakpoints.TabletLandscape] ||
              result.breakpoints[Breakpoints.Medium]
            ) {
              return ResponsiveLayoutType.Tablet;
            } else return ResponsiveLayoutType.Mobile;
          }
          return null;
        })
      )
      .subscribe((layout: ResponsiveLayoutType | null) => {
        this.responsiveLayoutType = layout;
      });
  }

  ngOnDestroy() {
    if (this.layoutSub) this.layoutSub.unsubscribe();
  }
}

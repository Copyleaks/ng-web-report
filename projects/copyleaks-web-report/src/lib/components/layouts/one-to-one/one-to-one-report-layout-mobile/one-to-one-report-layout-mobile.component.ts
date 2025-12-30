import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ReportDataService } from '../../../../services/report-data.service';
import { ReportMatchHighlightService } from '../../../../services/report-match-highlight.service';
import { ReportMatchesService } from '../../../../services/report-matches.service';
import { ReportViewService } from '../../../../services/report-view.service';
import { ReportStatisticsService } from '../../../../services/report-statistics.service';
import { OneToOneReportLayoutBaseComponent } from '../../base/report-layout-one-to-one-base.component';
import { ReportNgTemplatesService } from '../../../../services/report-ng-templates.service';
import { ReportRealtimeResultsService } from '../../../../services/report-realtime-results.service';
import { EReportMode } from '../../../../enums/copyleaks-web-report.enums';
import { ReportErrorsService } from '../../../../services/report-errors.service';

@Component({
	selector: 'copyleaks-one-to-one-report-layout-mobile',
	templateUrl: './one-to-one-report-layout-mobile.component.html',
	styleUrls: ['./one-to-one-report-layout-mobile.component.scss'],
	standalone: false,
})
export class OneToOneReportLayoutMobileComponent
	extends OneToOneReportLayoutBaseComponent
	implements OnInit, OnDestroy
{
	@ViewChild('contentViewersContainer', { static: false }) contentViewersContainer: ElementRef;

	@Input() reportMode: EReportMode;
	EReportMode = EReportMode;

	topHeightPercent: number = 40; // Initial height as a percentage
	bottomHeightPercent: number = 40; // Initial height as a percentage
	private dragging = false;

	constructor(
		reportDataSvc: ReportDataService,
		reportViewSvc: ReportViewService,
		matchSvc: ReportMatchesService,
		renderer: Renderer2,
		highlightSvc: ReportMatchHighlightService,
		statisticsSvc: ReportStatisticsService,
		templatesSvc: ReportNgTemplatesService,
		realTimeResultsSvc: ReportRealtimeResultsService,
		reportErrorsSvc: ReportErrorsService
	) {
		super(
			reportDataSvc,
			reportViewSvc,
			matchSvc,
			renderer,
			highlightSvc,
			statisticsSvc,
			templatesSvc,
			realTimeResultsSvc,
			reportErrorsSvc
		);
	}

	ngOnInit(): void {
		this.initOneToOneViewData();
	}

	ngAfterViewInit(): void {}

	startDragging(event: MouseEvent | TouchEvent): void {
		this.dragging = true;
		event.preventDefault(); // Prevent text selection during drag
	}

	@HostListener('window:mousemove', ['$event'])
	@HostListener('window:touchmove', ['$event'])
	onMouseMove(event: MouseEvent | TouchEvent): void {
		if (this.dragging) {
			let clientY;
			if (event instanceof MouseEvent) {
				clientY = event.clientY;
			} else {
				clientY = event.touches[0].clientY;
			}

			const containerTop = this.contentViewersContainer.nativeElement.getBoundingClientRect().top;
			const containerHeight = this.contentViewersContainer.nativeElement.clientHeight;
			const newTopHeight = clientY - containerTop;
			const newBottomHeight = containerHeight - newTopHeight;

			// Prevent the heights from being too small or negative
			if (newTopHeight > 60 && newBottomHeight > 60) {
				this.topHeightPercent = (newTopHeight / containerHeight) * 100 * 0.4;
				this.bottomHeightPercent = (newBottomHeight / containerHeight) * 100 * 0.4;
			}
		}
	}

	@HostListener('window:mouseup')
	@HostListener('window:touchend')
	@HostListener('window:touchcancel')
	onMouseUp(): void {
		this.dragging = false;
	}

	ngOnDestroy(): void {
		this.onComponentDestroy();
	}
}

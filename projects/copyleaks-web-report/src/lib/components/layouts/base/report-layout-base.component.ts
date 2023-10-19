import { Renderer2 } from '@angular/core';
import { ReportDataService } from '../../../services/report-data.service';
import iframeJsScript from '../../../utils/one-to-many-iframe-logic';
import { COPYLEAKS_REPORT_IFRAME_STYLES } from '../../../constants/report-iframe-styles.constants';
import { Match } from '../../../models/report-matches.models';
import { ReportMatchesService } from '../../../services/report-matches.service';
import { IReportViewEvent } from '../../../models/report-view.models';
import { ReportViewService } from '../../../services/report-view.service';
import * as helpers from '../../../utils/report-match-helpers';
import { ReportMatchHighlightService } from '../../../services/report-match-highlight.service';
import { ReportStatisticsService } from '../../../services/report-statistics.service';

export abstract class ReportLayoutBaseComponent {
	iframeStyle: string = COPYLEAKS_REPORT_IFRAME_STYLES;
	iframeJsScript: string = iframeJsScript;
	isHtmlView: boolean;

	abstract get rerendered(): boolean;

	get isAlertsMode(): boolean {
		return !!this.reportViewSvc.selectedAlert;
	}

	constructor(
		protected reportDataSvc: ReportDataService,
		protected reportViewSvc: ReportViewService,
		protected matchSvc: ReportMatchesService,
		protected renderer: Renderer2,
		protected highlightSvc: ReportMatchHighlightService,
		protected statisticsSvc: ReportStatisticsService
	) {}

	onReportViewChange(event: IReportViewEvent) {
		this.isHtmlView = event.isHtmlView;
		this.reportViewSvc.reportViewMode$.next(event);
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	protected _getRenderedMatches(matches: Match[] | null, originalHtml: string) {
		if (this.rerendered == true || !matches || !originalHtml) return null;

		const html = helpers.getRenderedMatches(matches, originalHtml);
		if (!html) return null;

		const css = this.renderer.createElement('style') as HTMLStyleElement;
		css.textContent = this.iframeStyle;
		const iframeStyle = css.outerHTML;

		const js = this.renderer.createElement('script') as HTMLScriptElement;
		js.textContent = this.iframeJsScript;
		const iframeJsScript = js.outerHTML;

		return html + iframeStyle + iframeJsScript;
	}
}

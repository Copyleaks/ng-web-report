/*
 * Public API Surface of copyleaks-web-report
 */

// Exported models
export * from './lib/components/core/cr-custom-results/models/cr-custom-results.enums';
export * from './lib/copyleaks-web-report.module';
export * from './lib/enums/copyleaks-web-report.enums';
export * from './lib/models/report-config.models';
export * from './lib/models/report-data.models';
export * from './lib/models/report-errors.models';
export * from './lib/models/report-matches.models';
export * from './lib/models/report-iframe-events.models';
export * from './lib/models/report-view.models';
export * from './lib/constants/report-scan-errors.constants';

// Exported components
export * from './lib/components/containers/report-results-container/components/empty-result-state/empty-result-state.component';
export * from './lib/components/core/cr-custom-empty-results/cr-custom-empty-results.component';
export * from './lib/components/core/cr-custom-results/components/cr-custom-results-box-content/cr-custom-results-box-content.component';
export * from './lib/components/core/cr-custom-results/cr-custom-results.component';
export * from './lib/components/core/cr-custom-tabs/components/cr-custom-tab-item/cr-custom-tab-item.component';
export * from './lib/components/core/cr-custom-tabs/cr-custom-tabs.component';
export * from './lib/components/core/cr-report-actions/cr-actions.component';
export * from './lib/components/core/cr-banner-section/cr-banner-section.component';
export * from './lib/components/core/cr-ai-source-match-upgrade/cr-ai-source-match-upgrade.component';
export * from './lib/components/containers/content-viewer-container/content-viewer-container.component';
export * from './lib/copyleaks-web-report.component';

// Exported services
export * from './lib/services/report-realtime-results.service';
export * from './lib/services/report-match-highlight.service';

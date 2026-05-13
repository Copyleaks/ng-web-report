<div align="center">

<img src="./images/copyleaks_logo_large.png" alt="Copyleaks" width="220"/>

# Copyleaks Web Report for Angular

### The drop-in plagiarism & AI-detection report your users will love.

[![npm version](https://img.shields.io/npm/v/@copyleaks/ng-web-report.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/@copyleaks/ng-web-report)
[![npm downloads](https://img.shields.io/npm/dm/@copyleaks/ng-web-report.svg?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/@copyleaks/ng-web-report)
[![license](https://img.shields.io/npm/l/@copyleaks/ng-web-report.svg?style=flat-square&color=lightgrey)](https://github.com/Copyleaks/ng-web-report/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/angular-19-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Built by Copyleaks](https://img.shields.io/badge/built%20by-Copyleaks-0066FF?style=flat-square)](https://copyleaks.com)

<br/>

<img src="./images/demo.gif" alt="Web Report Demo" width="720"/>

<br/>

<a href="#-quick-start"><strong>Quick Start</strong></a> ·
<a href="#-whats-in-the-report"><strong>What's Inside</strong></a> ·
<a href="#-api-reference"><strong>API</strong></a> ·
<a href="#-customization"><strong>Customization</strong></a> ·
<a href="#-real-time-results"><strong>Real-Time</strong></a> ·
<a href="https://docs.copyleaks.com/" target="_blank"><strong>Docs ↗</strong></a> ·
<a href="https://help.copyleaks.com/" target="_blank"><strong>Help Center ↗</strong></a>

</div>

<br/>

---

## ✨ Why Copyleaks Web Report?

Stop building a plagiarism/AI report UI from scratch. **`@copyleaks/ng-web-report`** is a battle-tested Angular module that drops into your app and renders a complete, polished, accessible report — backed by the same engine that powers [copyleaks.com](https://copyleaks.com).

Wire up three endpoints. Drop in one component. Ship.

```html
<copyleaks-web-report [reportEndpointConfig]="endpointConfig"></copyleaks-web-report>
```

That's it. Everything below is for when you want to go further.

<br/>

---

## 🚀 Quick Start

### 1. Install

```bash
npm install @copyleaks/ng-web-report --save
```

> 📦 Pick the right version for your Angular: **Angular 19 → `^2.0.0`** · **Angular 13 → `^1.9.99`** · [full version matrix ↓](#-angular-version-support)
>
> 🔑 Don't have API keys yet? Grab them from the [Copyleaks API docs](https://docs.copyleaks.com/).

### 2. Import the module

```typescript
import { CopyleaksWebReportModule } from '@copyleaks/ng-web-report';

@NgModule({
	imports: [CopyleaksWebReportModule /* …your other imports */],
})
export class AppModule {}
```

### 3. Render the component

```html
<copyleaks-web-report
	[reportEndpointConfig]="endpointConfig"
	(onReportRequestError)="handleError($event)"
	(onCompleteResultUpdate)="handleUpdate($event)"></copyleaks-web-report>
```

```typescript
endpointConfig: IClsReportEndpointConfigModel = {
	crawledVersion: {
		url: 'https://api.yoursite.com/scans/{SCAN_ID}/crawled-version',
		headers: { Authorization: 'Bearer …' },
	},
	completeResults: {
    url: 'https://api.yoursite.com/scans/{SCAN_ID}/results',
    headers: { Authorization: 'Bearer …' }
  },
	result: {
		url: 'https://api.yoursite.com/scans/{SCAN_ID}/results/{RESULT_ID}',
		headers: { Authorization: 'Bearer …' },
	},
};
```

**Done.** You now have a full plagiarism + AI report in your app.

<br/>

---

## 🌟 Features

|     | Feature                   | What you get                                                                                            |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| 🎨  | **Flexible Layouts**      | One-to-One, One-to-Many, AI-only, and Writing-Feedback — desktop & mobile variants ship out of the box. |
| 📱  | **Fully Responsive**      | Adapts cleanly across desktop, tablet, and mobile breakpoints.                                          |
| 🔌  | **Pluggable Endpoints**   | Bring your own API — just point the component at three URLs.                                            |
| 🧩  | **Deep Customization**    | Inject your own actions, tabs, results, empty states, and locked-result templates.                      |
| ⚡  | **Real-Time Streaming**   | Push new results into the view as they arrive — perfect for incremental scans.                          |
| ♿  | **Accessibility-First**   | Designed against WCAG and audited via [VPAT](https://copyleaks.com/accessibility/).                     |
| 🛡   | **Robust Error Handling** | Every failed request is surfaced through a single typed event.                                          |
| 🌍  | **i18n Ready**            | Works in any locale via `@angular/localize`.                                                            |

<br/>

---

## 📊 What's in the Report?

A complete, production-ready report UI — every piece below is rendered for you out of the box.

### 🔍 Plagiarism Detection

- **One-to-Many view** — source document side-by-side with a ranked list of matching results from across the web, your repository, and internal databases.
- **One-to-One comparison** — full side-by-side compare against a single suspect document with synchronized scrolling and match navigation.
- **Match highlighting** — color-coded identical / minor-changes / related-meaning matches, in both text and HTML views.
- **Per-result drill-down** — click any match to jump straight to the matching passage in the suspect, with character-level precision.
- **Result filtering** — filter by category, exclude self-matches, omit quotes/citations, and more.
- **Locked & premium results** — built-in support for paywalled / restricted matches with a fully customizable template.

### 🤖 AI Content Detection

- **AI phrases highlighting** — every AI-detected sentence is highlighted inline with a confidence indicator.
- **AI Logic banner** — explains _why_ a passage was flagged (the "explainable AI" video / rationale).
- **AI source matches** — when an AI-generated passage matches a known source, it's surfaced as a dedicated match entry.
- **AI-only layout** — when plagiarism is disabled, the report cleanly renders an AI-focused view.
- **AI disclaimer** — built-in disclaimer block to set the right expectations with end users.

### ✍️ Writing Feedback & Assessment

- **Corrections** — grammar, spelling, and style corrections rendered inline with one-click accept/reject actions.
- **Readability score** — surfaces readability metrics alongside the content.
- **Categories analysis panel** — breakdown by category (grammar, spelling, mechanics, etc.) for assessment workflows.
- **Assessment Tool score panel** — dedicated scoring view for the Assessment Tool report mode.

### 📑 Content Viewer

- **Text & HTML modes** — switch between plain-text and rendered HTML, with the report intelligently disabling modes that aren't available.
- **Pagination** — page-level navigation for long documents (URL-preserved via `sourcePage` / `suspectPage` query params).
- **RTL support** — automatic right-to-left layout for Arabic, Hebrew, and other RTL languages.

### ⚡ Real-Time & Performance

- **Real-time results streaming** — push new matches into the live view via `ReportRealtimeResultsService.pushNewResults()`.
- **Section animations** — newly arriving real-time results are gracefully animated into the list.
- **Skeleton loaders** — every async section has a polished loading state — no layout shift, no janky spinners.

### 🚨 Alerts & Errors

- **Built-in alerts container** — surfaces suspicious content, sensitive-data, and policy alerts with deep-linkable `alertCode`s.
- **Typed error events** — every failed API call comes back through a single `onReportRequestError` event with the request context attached.

### 🎛 Custom Slots

- **`<cr-actions>`** — your own action bar (download, share, custom workflows).
- **`<cr-custom-tabs>`** — extra tabs alongside the AI/Plagiarism tabs.
- **`<cr-custom-results>`** — append to _or_ fully replace the results list.
- **`<cr-custom-empty-results>`** — branded empty state.
- **`[lockedResultTemplateRef]`** — fully custom locked-result template (great for upgrade prompts).

### 📱 Layouts & Responsiveness

- **Desktop, tablet, and mobile** variants for every layout — including a dedicated mobile AI-phrases header.
- Four layout types: **`OneToMany`**, **`OneToOne`**, **`OnlyAi`**, **`WritingFeedback`**.

> 💡 Want a deeper walkthrough of what each section means? See the [Copyleaks Help Center](https://help.copyleaks.com/).

<br/>

---

## 🅰️ Angular Version Support

| Angular | Library                 | Install                                               |
| ------- | ----------------------- | ----------------------------------------------------- |
| **19**  | `2.x.x` _(current)_     | `npm install @copyleaks/ng-web-report@^2.0.0 --save`  |
| **13**  | `1.x.x` _(maintenance)_ | `npm install @copyleaks/ng-web-report@^1.9.99 --save` |

<details>
<summary><strong>📑 Peer dependencies</strong></summary>

<br/>

**Angular 19 (v2.x)**

| Package                      | Version  |
| ---------------------------- | -------- |
| `@angular/common`            | ^19.2.14 |
| `@angular/core`              | ^19.2.14 |
| `@angular/localize`          | ^19.2.14 |
| `@angular/material`          | ^19.2.19 |
| `ngx-flexible-layout`        | ^19.0.0  |
| `ngx-skeleton-loader`        | ^6.0.0   |
| `@swimlane/ngx-charts`       | ^22.0.0  |
| `scroll-into-view-if-needed` | ^2.2.28  |

**Angular 13 (v1.x)**

| Package                      | Version         |
| ---------------------------- | --------------- |
| `@angular/common`            | ^13.1.1         |
| `@angular/core`              | ^13.1.1         |
| `@angular/localize`          | ^13.1.1         |
| `@angular/material`          | ^13.1.1         |
| `@angular/flex-layout`       | ^13.0.0-beta.36 |
| `ngx-skeleton-loader`        | ^5.0.0          |
| `scroll-into-view-if-needed` | ^2.2.28         |

</details>

<br/>

---

## 📚 API Reference

### Inputs

| Input                     | Type                            | Required | Description                                                                    |
| ------------------------- | ------------------------------- | :------: | ------------------------------------------------------------------------------ |
| `reportEndpointConfig`    | `IClsReportEndpointConfigModel` |    ✅    | Endpoints + headers for fetching report data.                                  |
| `showDisabledProducts`    | `boolean`                       |    —     | Show products that are disabled for the scan. Default `false`.                 |
| `lockedResultTemplateRef` | `TemplateRef<any>`              |    —     | Custom template for locked results. Falls back to the default view if omitted. |

### Outputs

| Output                   | Payload                       | When it fires                                                     |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `onReportRequestError`   | `ReportHttpRequestErrorModel` | Any HTTP request the component made failed.                       |
| `onCompleteResultUpdate` | `ICompleteResults`            | Complete results were fetched, **or** the filter options changed. |

### Query parameters the component reads & writes

The report keeps its state in the URL so deep links Just Work™.

| Param                                                                         | Type               | Purpose                                            |
| ----------------------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| `contentMode`                                                                 | `'text' \| 'html'` | Switches content view (if that mode is available). |
| `sourcePage` / `suspectPage`                                                  | `number`           | Page number in text-view pagination (1-indexed).   |
| `suspectId`                                                                   | `string`           | The selected matching result.                      |
| `alertCode`                                                                   | `string`           | The currently open alert.                          |
| `viewMode`, `selectedCustomTabId`, `selectedResultsCategory`, `showAIPhrases` | various            | Preserve UI state across reloads.                  |

<br/>

---

## 🔧 Configuring Endpoints

> 📘 For the full request/response shape of each endpoint, see the [Copyleaks API documentation](https://docs.copyleaks.com/).

### `IClsReportEndpointConfigModel`

| Field                   | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `crawledVersion`        | Endpoint for the crawled version of the scanned content.                    |
| `completeResults`       | Endpoint for the full scan results.                                         |
| `result`                | Per-result endpoint. **Must include the `{RESULT_ID}` placeholder.**        |
| `progress` _(optional)_ | Enables the real-time view. See [Real-Time Results ↓](#-real-time-results). |

### `IEndpointDetails`

| Field     | Type                     |                                |
| --------- | ------------------------ | ------------------------------ |
| `url`     | `string`                 | The API endpoint URL.          |
| `headers` | `Record<string, string>` | Headers sent on every request. |

### Full example

```typescript
import { IClsReportEndpointConfigModel } from '@copyleaks/ng-web-report';

const headers = {
	Authorization: 'Bearer your-auth-token',
	'Content-Type': 'application/json',
};

const reportEndpointConfig: IClsReportEndpointConfigModel = {
	crawledVersion: { url: 'https://api.yourservice.com/crawled-version', headers },
	completeResults: { url: 'https://api.yourservice.com/complete-results', headers },
	result: { url: 'https://api.yourservice.com/result/{RESULT_ID}', headers },
};
```

<br/>

---

## 🛎 Event Handling

```typescript
import { ICompleteResults, ReportHttpRequestErrorModel } from '@copyleaks/ng-web-report';

handleError(error: ReportHttpRequestErrorModel): void {
	// Surface a toast, retry, log to Sentry, etc.
}

handleUpdate(results: ICompleteResults): void {
	// React to new complete results or filter changes.
}
```

<br/>

---

## 🎨 Customization

The report ships with sensible defaults and **first-class extension points** so you can inject your own UI without forking the library.

<details open>
<summary><strong><code>&lt;cr-actions&gt;</code> — custom action buttons</strong></summary>

<br/>

Replace the default action bar with your own buttons, menus, or logic.

```html
<copyleaks-web-report ...>
	<cr-actions>
		<button (click)="download()">Download PDF</button>
		<button (click)="share()">Share</button>
	</cr-actions>
</copyleaks-web-report>
```

</details>

<details>
<summary><strong><code>&lt;cr-custom-tabs&gt;</code> — extra tabs alongside AI / Plagiarism</strong></summary>

<br/>

Add as many custom tabs as you like. The `[flexGrow]` input controls the tab's width relative to the others (e.g. `0.3` means it claims 30% of the row).

```html
<copyleaks-web-report ...>
	<cr-custom-tabs>
		<cr-custom-tab-item [flexGrow]="0.3">
			<cr-custom-tab-item-title>Insights</cr-custom-tab-item-title>
			<cr-custom-tab-item-content>
				<app-insights-panel></app-insights-panel>
			</cr-custom-tab-item-content>
		</cr-custom-tab-item>
	</cr-custom-tabs>
</copyleaks-web-report>
```

</details>

<details>
<summary><strong><code>&lt;cr-custom-results&gt;</code> — augment or replace the results list</strong></summary>

<br/>

Use the `[reportView]` input to control whether your content **appends to** or **replaces** the standard results.

| Mode                                     | Behavior                                   |
| ---------------------------------------- | ------------------------------------------ |
| `ECustomResultsReportView.Partial` (`0`) | Renders **beneath** the default results.   |
| `ECustomResultsReportView.Full` (`1`)    | **Replaces** the default results entirely. |

```html
<copyleaks-web-report ...>
	<cr-custom-results [reportView]="reportView">
		<cr-custom-results-box-content>
			<app-my-results></app-my-results>
		</cr-custom-results-box-content>
	</cr-custom-results>
</copyleaks-web-report>
```

</details>

<details>
<summary><strong><code>&lt;cr-custom-empty-results&gt;</code> — branded empty state</strong></summary>

<br/>

```html
<copyleaks-web-report ...>
	<cr-custom-empty-results>
		<div class="empty">
			<h3>No matches found 🎉</h3>
			<p>This document looks original.</p>
		</div>
	</cr-custom-empty-results>
</copyleaks-web-report>
```

</details>

<details>
<summary><strong><code>[lockedResultTemplateRef]</code> — customize locked results</strong></summary>

<br/>

Useful for paywalls, upgrade prompts, or permission gates. Omit the input to use the default locked view.

```html
<ng-template #lockedResultTemplateRef let-result="result">
	<app-upgrade-card [result]="result"></app-upgrade-card>
</ng-template>

<copyleaks-web-report ... [lockedResultTemplateRef]="lockedResultTemplateRef"></copyleaks-web-report>
```

</details>

<br/>

---

## ⚡ Real-Time Results

For incremental scans, push new results into the live view as they arrive.

> ℹ️ **Prerequisite:** the real-time view is only enabled when you include the `progress` endpoint in your `reportEndpointConfig`.

```typescript
import { ReportRealtimeResultsService, ResultPreview } from '@copyleaks/ng-web-report';

@Component({
	/* … */
})
export class YourComponent {
	constructor(private realtime: ReportRealtimeResultsService) {}

	onNewBatch(results: ResultPreview[]): void {
		this.realtime.pushNewResults(results);
	}
}
```

The component handles ordering, deduping, and rendering for you.

<br/>

---

## ♿ Accessibility

Copyleaks Web Report is built with accessibility as a first-class concern — keyboard navigation, ARIA semantics, focus management, and high-contrast support are all baked in.

📄 **[Download the VPAT report (PDF)](https://copyleaks.com/accessibility/)** from the Copyleaks Commitment to Accessibility page.

<br/>

---

## 💬 Resources & Support

|     | Resource                                                               | Link                                                                               |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 📘  | **API Documentation** — endpoints, auth, payload shapes                | [docs.copyleaks.com](https://docs.copyleaks.com/)                                  |
| 🛟   | **Help Center** — how the report is interpreted, end-user guides, FAQs | [help.copyleaks.com](https://help.copyleaks.com/)                                  |
| 🐛  | **Bug reports & feature requests**                                     | [GitHub Issues](https://github.com/Copyleaks/ng-web-report/issues)                 |
| 📦  | **npm package**                                                        | [@copyleaks/ng-web-report](https://www.npmjs.com/package/@copyleaks/ng-web-report) |
| 🌐  | **Copyleaks product site**                                             | [copyleaks.com](https://copyleaks.com)                                             |

<br/>

---

## 📄 License

[MIT](https://github.com/Copyleaks/ng-web-report/blob/main/LICENSE) © [Copyleaks](https://copyleaks.com)

<br/>

<div align="center">

Built with ❤️ by the <a href="https://copyleaks.com">Copyleaks</a> team.

</div>

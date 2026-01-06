# Copyleaks Web Report

[![npm version](https://img.shields.io/npm/v/@copyleaks/ng-web-report.svg)](https://www.npmjs.com/package/@copyleaks/ng-web-report)
[![license](https://img.shields.io/npm/l/@copyleaks/ng-web-report.svg)](https://github.com/Copyleaks/ng-web-report/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/angular-19-brightgreen)](https://angular.io/)

<img align="center" src="./images/demo.gif" alt="Web Report Demo" width="600"/>
<br>
<br>

**Copyleaks Web Report** is an advanced Angular module designed to integrate plagiarism and AI detection reporting seamlessly. This module, developed by Copyleaks, offers a user-friendly, engaging, and flexible interface for presenting plagiarism and AI content reports; it is designed to showcase the authenticity and uniqueness of submitted files or text.

## Key Features

- **Customizable Layouts**: Various layout options for report display.
- **Responsive Design**: Adapts to different screen sizes for a consistent user experience.
- **API Integration**: Configurable endpoints for efficient data retrieval.
- **Accessibility Focused**: Inclusive design for a wider range of users.
- **Error Handling**: Effective management of data retrieval errors.

---

## Installation

To install, run:
`npm install @copyleaks/ng-web-report --save`

---

## 🅰️ Angular Version Support

| Angular Version | Library Version               | Install Command                                       |
| --------------- | ----------------------------- | ----------------------------------------------------- |
| Angular 13      | `1.x.x` (latest: `1.9.99`)    | `npm install @copyleaks/ng-web-report@^1.9.99 --save` |
| Angular 19      | `2.x.x` (starting at `2.0.0`) | `npm install @copyleaks/ng-web-report@^2.0.0 --save`  |

---

## 📑 Peer Dependencies

### For Angular 13 (v1.x.x)

| Package                      | Version         |
| ---------------------------- | --------------- |
| `@angular/common`            | ^13.1.1         |
| `@angular/core`              | ^13.1.1         |
| `@angular/localize`          | ^13.1.1         |
| `@angular/material`          | ^13.1.1         |
| `@angular/flex-layout`       | ^13.0.0-beta.36 |
| `scroll-into-view-if-needed` | ^2.2.28         |
| `ngx-skeleton-loader`        | ^5.0.0          |

### For Angular 19 (v2.x.x)

| Package                      | Version  |
| ---------------------------- | -------- |
| `@angular/common`            | ^19.2.14 |
| `@angular/core`              | ^19.2.14 |
| `@angular/localize`          | ^19.2.14 |
| `@angular/material`          | ^19.2.19 |
| `ngx-flexible-layout`        | ^19.0.0  |
| `scroll-into-view-if-needed` | ^2.2.28  |
| `ngx-skeleton-loader`        | ^6.0.0   |
| `@swimlane/ngx-charts`       | ^22.0.0  |

---

## Integration

Import the module in your Angular app:

```typescript
import { CopyleaksWebReportModule } from '@copyleaks/ng-web-report';

@NgModule({
	imports: [
		CopyleaksWebReportModule,
		// other imports
	],
})
export class AppModule {}
```

## Using the Component

Add the component in your HTML templates:

```html
<copyleaks-web-report
	[reportEndpointConfig]="endpointConfig"
	[showDisabledProducts]="displayDisabledProducts"
	(onReportRequestError)="handleError($event)"
	(onCompleteResultUpdate)="handleUpdate($event)"></copyleaks-web-report>
```

### Inputs

- **`reportEndpointConfig` - Required**: (`IClsReportEndpointConfigModel`) Configures the data endpoints for fetching the report data, including URLs and headers.
- **`showDisabledProducts` - Optional**: (`boolean`) A flag determining whether to show disabled products in the report interface. The default value is `false`.

### Outputs

- **`onReportRequestError`**: (`EventEmitter<ReportHttpRequestErrorModel>`) Emits an event with HTTP request data when any request to update or fetch report data fails, allowing for custom error handling.
- **`onCompleteResultUpdate`**: (`EventEmitter<ICompleteResults>`) Emits an event when the complete report results data is successfully retrieved and also when there is an update in the filter options (which are part of the complete results model). This ensures users are appropriately informed about the availability of complete results and any changes in the filter dialog data.

### Note on Report View Parameters

The Copyleaks Web Report Module interprets several query parameters to tailor the report view:

- **`contentMode`** (string): Determines the content view type. It accepts 'text' or 'html', which will only change the content view mode **if the selected mode is available**
- **`sourcePage`** & **`suspectPage`** (number): Represent the page number in text view pagination, starting from 1.
- **`suspectId`** (string): The identifier of the selected matching result.
- **`alertCode`** (string): The code of the selected alert.

These parameters allow for the dynamic and contextual presentation of the plagiarism report, adapting to user-specific requirements.

---

## Configuration and Models

### IClsReportEndpointConfigModel

This model is used for configuring the API endpoints for the plagiarism report data:

- **`crawledVersion`**: Endpoint details for fetching the crawled version of scanned content.
- **`completeResults`**: Endpoint details for fetching complete scanning results.
- **`result`**: This specifies the endpoint for retrieving individual scan results. It's important to include `{RESULT_ID}` within the endpoint URL, which acts as a placeholder for the unique identifier of each result and ensures that the correct result is fetched based on its specific ID.

#### IEndpointDetails

A nested interface in `IClsReportEndpointConfigModel` that defines the structure of each endpoint detail object:

- **`url`**: The URL of the API endpoint.
- **`headers`**: A dictionary of headers for the API call.

**Example Usage:**

```typescript
import { IClsReportEndpointConfigModel, IEndpointDetails } from '@copyleaks/ng-web-report';

// Example endpoint details
const crawledVersionEndpoint: IEndpointDetails = {
	url: 'https://api.yourservice.com/crawled-version',
	headers: {
		Authorization: 'Bearer your-auth-token',
		'Content-Type': 'application/json',
	},
};

const completeResultsEndpoint: IEndpointDetails = {
	url: 'https://api.yourservice.com/complete-results',
	headers: {
		Authorization: 'Bearer your-auth-token',
		'Content-Type': 'application/json',
	},
};

const resultEndpoint: IEndpointDetails = {
	url: 'https://api.yourservice.com/result/{RESULT_ID}',
	headers: {
		Authorization: 'Bearer your-auth-token',
		'Content-Type': 'application/json',
	},
};

// Configuring the IClsReportEndpointConfigModel
const reportEndpointConfig: IClsReportEndpointConfigModel = {
	crawledVersion: crawledVersionEndpoint,
	completeResults: completeResultsEndpoint,
	result: resultEndpoint,
};

// Use `reportEndpointConfig` in your application where needed
```

## Event Handling

Implement the following event handling methods in your Angular component:

```typescript
import { ICompleteResults, ReportHttpRequestErrorModel } from '@copyleaks/ng-web-report';

...

handleError(error: ReportHttpRequestErrorModel): void {
  // Your error handling logic here
}

handleUpdate(results: ICompleteResults): void {
  // Your logic for processing report updates here
}
```

---

## Advanced Usage

For advanced users, the Copyleaks Web Report offers extensive customization and control over the plagiarism report presentation and data handling. Here are some advanced techniques:

### Custom Templates and Content Injection

Utilize Angular's powerful templating capabilities to create custom layouts and display components for your plagiarism reports, enhancing the user interface and experience.

- **Adding Custom Actions with `<cr-actions>`**:
  Inject custom content directly into the Copyleaks report component. Use the `<cr-actions>` tag to insert fully custom report actions (both logic and style) into the report's interface.

  Example Usage:

  ```html
  <copyleaks-web-report ...>
  	<cr-actions>
  		<!-- Here, you can insert your custom actions, buttons, or any other interactive elements. -->
  	</cr-actions>
  </copyleaks-web-report>
  ```

  This feature allows for a high degree of customization, enabling users to tailor the report actions to their specific needs.

- **Adding Custom Tabs with `<cr-custom-tabs>`**:
  Enhance your plagiarism report with additional information and features using custom tabs. The `<cr-custom-tabs>` component allows for the integration of custom tabs alongside the standard AI and plagiarism tabs. Each tab is represented by a `<cr-custom-tab-item>`, which includes a title and content area defined by `<cr-custom-tab-item-title>` and `<cr-custom-tab-item-content>`. This setup lets you present additional, tailored content within the report's interface.

  Example Usage:

  ```html
  <copyleaks-web-report ...>
  	<cr-custom-tabs>
  		<cr-custom-tab-item [flexGrow]="0.3">
  			<cr-custom-tab-item-title>Here the title goes</cr-custom-tab-item-title>
  			<cr-custom-tab-item-content>Here the content goes</cr-custom-tab-item-content>
  		</cr-custom-tab-item>
  	</cr-custom-tabs>
  </copyleaks-web-report>
  ```

  The `cr-custom-tab-item` component includes a `flexGrow` input, which sets the `flex-grow` CSS property for the tab. This property determines the tab's width relative to other tabs in the Copyleaks report:
  **`[flexGrow]`**: A numeric value that defines the proportion of the available space inside the flex container that the tab should take up. For example, setting `[flexGrow]="0.3"` on a custom tab and `0.5` on each of the Plagiarism and AI tabs means the custom tab will take up 30% of the available space.

- **Adding Custom Results Section with `<cr-custom-results>`**:
  The `<cr-custom-results>` component allows extensive customization of the results section in the Copyleaks plagiarism report. Depending on the use case, it can either complement the existing results or replace them entirely.

  Example Usage:

  ```html
  <copyleaks-web-report ...>
  	<cr-custom-results [reportView]="reportView">
  		<cr-custom-results-box-content>
  			<!-- Content for the custom results section goes here -->
  		</cr-custom-results-box-content>
  	</cr-custom-results>
  </copyleaks-web-report>
  ```

  The `reportView` input, tied to the `ECustomResultsReportView` enum, dictates the display mode of the custom results section:

  - **`ECustomResultsReportView.Partial` (value `0`)**: When set to `Partial`, the custom results component appears beneath the standard report results.
  - **`ECustomResultsReportView.Full` (value `1`)**: When set to `Full`, the custom results component replaces the entire standard results section

  The `cr-custom-results-box-content` is used to define the content of the custom results section. Regardless if the `cr-custom-results-box-content` is added, this custom results component is displayed with a background animation, making it visually distinct and engaging.

- **Customizing Empty Results with `<cr-custom-empty-results>`**:
  The `<cr-custom-empty-results>` component is designed to provide a custom view for cases where no results are found in the Copyleaks plagiarism report. This allows for a more tailored user experience, particularly when you want to provide specific information or guidance in the event of an empty result set.

  ```html
  <copyleaks-web-report ...>
  	<cr-custom-empty-results>
  		<!-- Custom content for the empty results state goes here -->
  	</cr-custom-empty-results>
  </copyleaks-web-report>
  ```

- **Customizing Locked Results with `lockedResultTemplateRef`**:
  The `lockedResultTemplateRef` input of the `copyleaks-web-report` component enables the customization of locked result presentations within the plagiarism report. This feature is particularly useful for providing a tailored user experience for results that are not immediately accessible or require specific actions to unlock. Note that the default locked result view will be shown if the template reference isn't passed to the web report component.

  ##### **Usage**:

  The `lockedResultTemplateRef` is a template reference variable you can define in your Angular templates. You can then pass this template to the `copyleaks-web-report` component to customize how locked results are displayed.

  Example Usage:

  ```html
  <ng-template #lockedResultTemplateRef let-result="result">
  	<!-- Custom content for locked results goes here -->
  </ng-template>

  <copyleaks-web-report ... [lockedResultTemplateRef]="lockedResultTemplateRef" ...></copyleaks-web-report>
  ```

### Adding Real-Time Results

The `CopyleaksWebReportModule` includes the `ReportRealtimeResultsService`, a powerful feature that enables the addition of new results to the real-time view of the plagiarism report. This capability benefits applications where plagiarism check results are received incrementally and must be displayed to the user as they arrive**.**

##### **Usage**:

The `ReportRealtimeResultsService` is instrumental when you have the real-time view enabled (which is available if the `progress` endpoint is included in your configuration model). It allows for a dynamic and interactive experience by updating the report with new results as they become available.

The key function in this service is `pushNewResults`, which takes an array of `ResultPreview` objects and adds them to the existing results in the real-time view. This function can be used to incrementally update the report, ensuring that the latest results are always displayed.

Example Usage:

```typescript
import { ReportRealtimeResultsService, ResultPreview } from '@copyleaks/ng-web-report';

@Component({...})
export class YourComponent {
  constructor(private _realtimeResultsService: ReportRealtimeResultsService) {}

  addNewResults(newResults: ResultPreview[]): void {
    this._realtimeResultsService.pushNewResults(newResults);
  }
}
```

## Accessibility

The [VPAT report (PDF)](https://copyleaks.com/accessibility/) can be downloaded from Copyleaks Commitment to Accessibility page

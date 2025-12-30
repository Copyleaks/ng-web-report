/** User messages for text exclusion cases */
/// <reference types="@angular/localize" />

export const EXCLUDE_MESSAGE: { [key: string]: string } = {
	1: $localize`Omitted: Quotation`,
	2: $localize`Omitted: Reference`,
	3: $localize`Omitted: Header`,
	4: $localize`Omitted: Footer`,
	5: $localize`Omitted: HTML template`,
	6: $localize`Omitted: Table of content`,
	7: $localize`Omitted: Source code comment`,
	0: $localize`Hidden Sensitive Data`,
	8: $localize`This text was not scanned because there were not enough credits. Please upgrade your plan in order to scan the entire document.`,
	9: $localize`Omitted: Citation`,
	10: $localize`Omitted: Title`,
	11: $localize`Omitted: Matches exclusion template`,
};

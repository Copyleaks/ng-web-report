/** User messages for text exclusion cases */
import '@angular/localize/init';

export const EXCLUDE_MESSAGE: { [key: string]: string } = {
	1: $localize`Quotations are omitted according to your settings`,
	2: $localize`References are omitted according to your settings`,
	3: $localize`Headers are omitted according to your settings`,
	4: $localize`Footers are omitted according to your settings`,
	5: $localize`HTML templates are omitted according to your settings`,
	6: $localize`Tables of content are omitted according to your settings`,
	7: $localize`Source code comments are omitted according to your settings`,
	0: $localize`Sensitive data are hidden according to your settings`,
	8: $localize`This text was not scanned because there were not enough pages. Please upgrade your plan in order to scan the entire document.`,
	9: $localize`Citations are omitted according to your settings`,
	10: $localize`Titles are omitted according to your settings`,
	11: $localize`This text was not scanned because it matches content from your uploaded exclusion templates.`,
};

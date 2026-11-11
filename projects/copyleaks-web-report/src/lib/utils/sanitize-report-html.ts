import DOMPurify, { DOMPurify as DOMPurifyInstance } from 'dompurify';

/**
 * Attributes the report adds to the scan HTML to mark matches (see `getRenderedMatches`). They have no value, so the
 * sanitiser does not know them; everything else the report adds is `class`, `title` and `data-*`, which it keeps.
 */
const REPORT_MATCH_ATTRIBUTES = ['match', 'exclude', 'exclude-partial-scan'];

let purifier: DOMPurifyInstance | null = null;

/**
 * A DOMPurify instance of our own, so the hook below never changes how the host application's DOMPurify behaves.
 */
const getPurifier = (): DOMPurifyInstance | null => {
	if (purifier) return purifier;
	if (typeof window === 'undefined') return null;

	const instance = DOMPurify(window);
	if (!instance.isSupported) return null;

	// A stylesheet link keeps a crawled page's look; any other link type (preload, prefetch, import...) is removed.
	instance.addHook('uponSanitizeElement', (node, data) => {
		if (data.tagName === 'link' && (node as Element).getAttribute?.('rel')?.toLowerCase() !== 'stylesheet') {
			node.parentNode?.removeChild(node);
		}
	});

	purifier = instance;
	return purifier;
};

/**
 * Removes everything executable from the scan's HTML before the report loads it into its iframe (LMS-9906).
 *
 * The HTML is the stored, customer-submitted version of the scanned document, so it can carry a script, an event
 * handler or a `javascript:` URL. The iframe runs the report's own script, so the stored HTML must not run anything
 * next to it: such a script can post messages the report trusts as its own.
 *
 * Call it on the HTML after the matches are rendered into it (the match offsets point into the original string) and
 * before the report's own style and script are appended.
 *
 * @returns the sanitised document, or `null` when it cannot be sanitised here (no DOM): the caller then renders nothing.
 */
export const sanitizeReportHtml = (html: string | null): string | null => {
	if (!html) return html;

	const instance = getPurifier();
	if (!instance) return null;

	return instance.sanitize(html, {
		WHOLE_DOCUMENT: true,
		ADD_TAGS: ['link'],
		ADD_ATTR: REPORT_MATCH_ATTRIBUTES,
	}) as string;
};

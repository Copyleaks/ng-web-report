import DOMPurify, { DOMPurify as DOMPurifyInstance } from 'dompurify';

/**
 * Attributes the report adds to the scan HTML to mark matches (see `getRenderedMatches`). They have no value, so the
 * sanitiser does not know them; everything else the report adds is `class`, `title` and `data-*`, which it keeps.
 */
const REPORT_MATCH_ATTRIBUTES = ['match', 'exclude', 'exclude-partial-scan'];

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

let purifier: DOMPurifyInstance | null = null;

/**
 * A DOMPurify instance of our own, so the hook below never changes how the host application's DOMPurify behaves.
 */
const getPurifier = (): DOMPurifyInstance | null => {
	if (purifier) return purifier;
	if (typeof window === 'undefined') return null;

	const instance = DOMPurify(window);
	if (!instance.isSupported) return null;

	instance.addHook('uponSanitizeElement', (node, data) => {
		const element = node as Element;
		// A stylesheet link keeps a crawled page's look; any other link type (preload, prefetch, import...) is removed.
		if (data.tagName === 'link' && element.getAttribute?.('rel')?.toLowerCase() !== 'stylesheet') {
			node.parentNode?.removeChild(node);
		}
		// A named meta only describes the document: the report's iframe script finds a PDF by its pdf2htmlEX generator
		// meta. Any other meta (http-equiv refresh, charset, ...) is removed.
		if (
			data.tagName === 'meta' &&
			(!element.hasAttribute?.('name') || element.hasAttribute('http-equiv') || element.hasAttribute('charset'))
		) {
			node.parentNode?.removeChild(node);
		}
	});

	// The report's iframe script disables links through `document.links`, which holds only HTML links. A link inside an
	// SVG is not in it, so a click on one would take the iframe to any page, whose script the report then trusts.
	instance.addHook('uponSanitizeAttribute', (node, data) => {
		const element = node as Element;
		if (
			(data.attrName === 'href' || data.attrName === 'xlink:href') &&
			element.localName === 'a' &&
			element.namespaceURI !== HTML_NAMESPACE
		) {
			data.keepAttr = false;
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
		ADD_TAGS: ['link', 'meta'],
		ADD_ATTR: [...REPORT_MATCH_ATTRIBUTES, 'content'],
	}) as string;
};

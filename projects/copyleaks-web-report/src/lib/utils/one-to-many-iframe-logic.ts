/* tslint:disable */

import {
	CorrectionSelectEvent,
	MatchJumpEvent,
	MatchSelectEvent,
	PostMessageEvent,
} from '../models/report-iframe-events.models';

/**
 * document ready event handler
 * @param fn the callback to execute when the document is ready
 */
function onDocumentReady(fn: any) {
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		setTimeout(fn, 1);
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

/**
 * Callback to execute when the document is ready
 */
function ready() {
	let current: HTMLSpanElement | null;
	let currentMulti: HTMLSpanElement[] = [];
	let matches: HTMLSpanElement[];
	let currentZoom: number = 1;
	let pdfZoom: number = 1;

	(window as any).addEventListener(
		'wheel',
		function (event) {
			if (event && event.ctrlKey) {
				event.preventDefault(); // Prevent the default zoom action
				// Check if the scroll is up or down & update the zoom property accordingly
				if (event.deltaY < 0) zoomIn();
				else if (event.deltaY > 0) zoomOut();
			}
		},
		{ passive: false }
	);

	(window as any).addEventListener('click', function (event) {
		if (event.shiftKey) document.body.style.userSelect = 'none';
		else document.body.style.userSelect = 'auto';
	});

	let isPdf = document.querySelector('meta[content="pdf2htmlEX"]') !== null;
	if (isPdf) pdfZoom = 0.4; // this is the default zoom for pdfs in the pdf2htmlEX format

	(window as any).addEventListener('message', onMessageFromParent);

	addMatchTooltipEventListeners();

	init();

	/**
	 * Initialization code, will execute before emitting iframe-ready event
	 */
	function init() {
		Array.from(document.links).forEach(x => {
			x.href = 'javascript:void(0)';
			x.title = 'disable link';
			var dataDestAttr = x.getAttribute('data-dest-detail');
			if (dataDestAttr) {
				x.setAttribute('data-dest-detail', '');
			}
		}); // disable links
		matches = Array.from(document.querySelectorAll('span[match]'));
		matches.forEach(elem => {
			elem.addEventListener('click', onMatchClick);
			elem.addEventListener('mouseenter', onMatchHover);
			elem.addEventListener('mouseleave', onMatchHover);
		});

		document.querySelectorAll('span[exclude-partial-scan]').forEach((elem: any) => {
			elem.addEventListener('click', () => messageParent({ type: 'upgrade-plan' }));
			elem.addEventListener('mouseenter', onMatchHover);
			elem.addEventListener('mouseleave', onMatchHover);
		});
	}

	/**
	 * Message event handler
	 */
	function onMessageFromParent(nativeEvent: any) {
		if (nativeEvent.source !== (window as any).parent) {
			return;
		}
		const event = nativeEvent.data as PostMessageEvent;
		switch (event.type) {
			case 'match-select':
				handleBroadcastMatchSelect(event);
				break;
			case 'match-jump':
				onMatchJump(event);
				break;
			case 'zoom':
				if (event.zoomIn) zoomIn();
				else zoomOut();
				break;
			case 'multi-match-select':
				// do nothing
				break;

			case 'correction-select':
				handelCorrectionSelect(event);
				break;
			default:
				console.error('unknown event in frame', nativeEvent);
		}
	}

	/**
	 * handle a broadcasted `match-select` event
	 * @param event the match select event
	 */
	function handleBroadcastMatchSelect(event: MatchSelectEvent) {
		const elem: any = document.querySelector<HTMLSpanElement>(`span[match][data-index='${event.index}']`);
		if (!elem && event.index !== -1) {
			messageParent({ type: 'match-warn' });
		}
		if (!elem && event.index === -1 && current) {
			currentMulti.forEach(e => e?.toggleAttribute('on', false));
			currentMulti = [];
			current?.toggleAttribute('on', false);
			current = null;
			messageParent({ type: 'match-select', index: -1 });
			return;
		}
		onMatchSelect(elem, true); // should not rebroadcast
	}

	/**
	 * handle a broadcasted `match-select` event
	 * @param event the match select event
	 */
	function handelCorrectionSelect(event: CorrectionSelectEvent) {
		const elements: any = document.querySelectorAll<HTMLSpanElement>(`span[match][data-gid='${event.gid}']`);
		let elem: HTMLSpanElement;
		for (let element of elements) {
			// find the first element that can be viewed as selected
			if ((element as HTMLSpanElement).innerHTML && (element as HTMLSpanElement).innerHTML.trim().length > 0) {
				elem = element;
				break;
			}
		}

		// select the correction
		current?.toggleAttribute('on', false);
		current = elem;
		currentMulti.forEach(e => e?.toggleAttribute('on', false));
		if (current) {
			currentMulti = [...elements];
			currentMulti.forEach(e => {
				e?.toggleAttribute('on', true);
			});
		} else currentMulti = [];
		current?.toggleAttribute('on', true);
		if (isPdf) {
			elem?.closest('.pc')?.classList?.add('opened');
			currentMulti.forEach(e => e?.closest('.pc')?.classList?.add('opened'));
		}
		current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	/**
	 * Event handler for a `MatchJumpEvent` that is fired when the user clicks the
	 * go to next/prev match buttons
	 */
	function onMatchJump(event: MatchJumpEvent) {
		if (!current) {
			onMatchSelect(matches[0]);
			return;
		}
		const first = matches[0];
		const last = matches[matches.length - 1];
		if ((current === first && !event.forward) || (current === last && event.forward)) {
			return;
		}

		const currentIndex = matches.indexOf(current);
		const nextIndex = currentIndex + (event.forward ? 1 : -1);

		onMatchSelect(matches[nextIndex]);
	}

	/**
	 * Emits an event to the parent window using PostMessage API
	 * @param event the event content to emit
	 */
	function messageParent(event: PostMessageEvent) {
		(window as any).parent.postMessage(event, '*');
	}

	/**
	 * Event handler for the default click event of a match
	 * @param event the default mouse event object
	 */
	function onMatchClick(event: MouseEvent) {
		const elem = event.target as HTMLSpanElement;
		// check if the shift key is pressed (multi selection)
		if (event.shiftKey) {
			onMatchMultiSelect(elem);
		} else {
			onMatchSelect(elem);
		}
	}

	/**
	 * Execute the logic of a match selection.
	 * - highlight `elem` and message the parent window about it
	 * - if an element is allready highlighted turn it off and highlight `elem`
	 * @param elem the selected element
	 */
	function onMatchSelect(elem: HTMLSpanElement, broadcast: boolean = false): void {
		if (!broadcast && current === elem) {
			current?.toggleAttribute('on', false);
			current = null;
			currentMulti.forEach(e => e?.toggleAttribute('on', false));
			currentMulti = [];
			messageParent({ type: 'match-select', index: -1 });
			return;
		}
		if (!broadcast && current) {
			current?.toggleAttribute('on', false);
		}
		current = elem;
		currentMulti.forEach(e => e?.toggleAttribute('on', false));
		if (current) currentMulti = [current];
		else currentMulti = [];
		current?.toggleAttribute('on', true);
		if (isPdf) {
			elem?.closest('.pc')?.classList?.add('opened');
		}
		current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		messageParent({
			type: 'match-select',
			index: !!current?.dataset?.['index'] ? +(current?.dataset?.['index'] ?? '') : -1,
		});
	}

	/**
	 * Execute the logic of a multi match selection.
	 * - highlight and add the `elem` to the highlighted matches
	 * @param elem the selected element
	 */
	function onMatchMultiSelect(elem: HTMLSpanElement, broadcast: boolean = false): void {
		const foundSelection = currentMulti.find(e => elem === e);
		if (!broadcast && foundSelection) {
			foundSelection?.toggleAttribute('on', false);
			currentMulti = currentMulti.filter(e => e != elem);
			const indexes = currentMulti.map(e => +e?.dataset?.['index']);
			if (currentMulti.length === 1) current = currentMulti[0];
			else current = null;
			messageParent({ type: 'multi-match-select', indexes });
			return;
		}
		currentMulti.push(elem);
		elem?.toggleAttribute('on', true);
		if (isPdf) {
			elem?.closest('.pc')?.classList?.add('opened');
		}
		elem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

		if (currentMulti.length === 1) current = currentMulti[0];
		else current = null;
		const indexes = currentMulti.map(e => (!!e?.dataset?.['index'] ? +(e?.dataset?.['index'] ?? '') : -1));
		messageParent({ type: 'multi-match-select', indexes });
	}

	/**
	 * Event handler for the default `mouseenter` or `mouseleave` event
	 * @param event the default mouse event object
	 */
	function onMatchHover(event: MouseEvent): void {
		const elem = event?.target as HTMLSpanElement;
		elem?.classList?.toggle('hover');
	}

	function zoomIn() {
		currentZoom += 0.1;
		updateIframeZoomView();
	}

	function zoomOut() {
		currentZoom = Math.max(0.1, currentZoom - 0.1);
		updateIframeZoomView();
	}

	function updateIframeZoomView() {
		if (isPdf) {
			// for pdf the scale doesn't work for the html or body elements, because the divs in the pdf are all with absolute positioning
			let pageContainer = document.querySelector('#page-container') as HTMLElement;
			let sidebar = document.querySelector('#sidebar') as HTMLElement;
			if (pageContainer) {
				pageContainer.style.setProperty('transform', `scale(${currentZoom})`);
				pageContainer.style.setProperty('transform-origin', '0 0');
				pageContainer.style.setProperty('height', `fit-content`);
				pageContainer.style.setProperty('overflow', `hidden`);
			} else {
				document.body.style.setProperty('transform', `scale(${currentZoom})`);
				document.body.style.setProperty('transform-origin', '0 0');
			}

			if (sidebar) sidebar.style.setProperty('display', 'none');
		} else {
			document.body.style.setProperty('transform', `scale(${currentZoom})`);
			document.body.style.setProperty('transform-origin', '0 0');
		}
	}

	function addMatchTooltipEventListeners() {
		document.querySelectorAll('span[match][data-type="3"]').forEach(match => {
			match.addEventListener('mouseenter', (_: MouseEvent) => {
				const tooltipSpanContent = generateWritingFeedbackMatchTooltip(
					(match as HTMLSpanElement).dataset?.['wrongText'],
					(match as HTMLSpanElement).dataset?.['correctionText']
				);

				// create a span element with the class name tooltip-match-content-container and style the color to red
				const tooltipSpan = document.createElement('span');
				tooltipSpan.classList.add('tooltip-match-content-container');
				tooltipSpan.innerHTML = tooltipSpanContent;
				tooltipSpan.style.transform = `translate(-50%, 0) scale(${1 / (currentZoom * pdfZoom)})`;
				tooltipSpan.style.transformOrigin = '50% 100%';
				match.appendChild(tooltipSpan);
				modifyTooltipsStyles(match);
			});

			match.addEventListener('mouseleave', () => {
				// remove span with class name tooltip-match-content-container
				document.querySelectorAll('.tooltip-match-content-container').forEach(e => e.remove());
			});
		});

		// document.querySelectorAll('span[exclude]').forEach(excludedMatch => {
		// 	excludedMatch.addEventListener('mouseenter', (_: MouseEvent) => {
		// 		const tooltipSpanContent = (excludedMatch as HTMLSpanElement).dataset?.['reason'];

		// 		const tooltipSpan = document.createElement('span');
		// 		tooltipSpan.classList.add('excluded-reason-tooltip');
		// 		tooltipSpan.innerHTML = tooltipSpanContent;
		// 		tooltipSpan.style.transform = `translate(-50%, 0) scale(${1 / (currentZoom * pdfZoom)})`;
		// 		tooltipSpan.style.transformOrigin = '50% 100%';
		// 		excludedMatch.appendChild(tooltipSpan);
		// 		modifyTooltipsStyles(excludedMatch, '.excluded-reason-tooltip');
		// 	});

		// 	excludedMatch.addEventListener('mouseleave', () => {
		// 		document.querySelectorAll('.excluded-reason-tooltip').forEach(e => e.remove());
		// 	});
		// });
	}

	function generateWritingFeedbackMatchTooltip(wrongText: string, correctionText: string): string {
		var contentHTML = '';

		if (wrongText !== correctionText) {
			contentHTML += `<span class="wrong-text">${wrongText}</span>`;
		}
		// Adding SVG arrow
		if (wrongText != correctionText && correctionText)
			contentHTML += `<span style='font-size:14px !important; line-height: normal !important;'>&#129106;</span>`;

		if (correctionText) {
			contentHTML += `<span class="correction-text">${correctionText}</span>`;
		}
		return contentHTML;
	}

	function modifyTooltipsStyles(match?: Element, tooltipClass: string = '.tooltip-match-content-container') {
		const tooltip = match.querySelector(tooltipClass) as HTMLElement;

		if (tooltip instanceof HTMLElement) {
			let tooltipRect = tooltip.getBoundingClientRect();
			let tooltipWidth = tooltipRect.width;

			let iframeWidth: number;
			if (isPdf) {
				let pageContainer = document.querySelector('#page-container') as HTMLElement;
				iframeWidth = pageContainer.clientWidth;
			} else iframeWidth = window.innerWidth;

			let matchRect = match.getBoundingClientRect();

			// Move tooltip to the right side if it exceeds the iframe left boundary
			if (matchRect.left + tooltipWidth > iframeWidth) {
				tooltip.style.transform = `translate(-100%, 0) scale(${1 / (currentZoom * pdfZoom)})`;
				tooltip.style.transformOrigin = `calc(100% + ${matchRect.width + 10}px) -50%`;
				tooltip.classList.add('right-arrow');
			}
			// Move tooltip to the left side if it exceeds the iframe left boundary
			else if (matchRect.right - tooltipWidth < 0) {
				tooltip.style.transform = `translate(0, 0) scale(${1 / (currentZoom * pdfZoom)})`; // Move tooltip to the right side of the match
				tooltip.style.transformOrigin = `-${matchRect.width + 10}px -50%`;
				tooltip.classList.add('left-arrow');
			}

			// if (matchRect.top - tooltipHeight < 0) {
			// 	tooltip.style.transform = `translate(-50%, 100%) scale(${1 / (currentZoom * pdfZoom)})`; // Move tooltip under the match
			// 	tooltip.style.transformOrigin = `0 -${2 * matchRect.height}px`;
			// }
		}
	}
}

export default `(${onDocumentReady.toString()})(${ready.toString()})`;

/* tslint:disable */

import { PostMessageEvent, MatchJumpEvent, MatchSelectEvent } from '../models/report-iframe-events.models';

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

function ready() {
	let current: HTMLSpanElement | null;
	let matches: HTMLSpanElement[];
	let groups: { [gid: string]: HTMLSpanElement[] };
	let isPdf = document.querySelector('meta[content="pdf2htmlEX"]') !== null;
	let currentZoom: number = 1;

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

	(window as any).addEventListener('message', handleMessageFromParent);
	init();

	/**
	 * Initialization code, will execute before emitting iframe-ready event
	 */
	function init() {
		Array.from(document.links).forEach(x => (x.href = 'javascript:void(0)')); // disable links
		matches = Array.from(document.querySelectorAll('span[match]'));
		groups = matches.reduce((prev: any, curr: any) => {
			prev[curr.dataset.gid] = prev[curr.dataset.gid] || [];
			prev[curr.dataset.gid].push(curr);
			return prev;
		}, {});

		matches.forEach(elem => {
			elem.addEventListener('click', onMatchClick);
			elem.addEventListener('mouseenter', onMatchHover);
			elem.addEventListener('mouseleave', onMatchHover);
		});

		document.querySelectorAll('span[exclude-partial-scan]').forEach(elem => {
			elem.addEventListener('click', () => messageParent({ type: 'upgrade-plan' }));
		});
	}

	function handleMessageFromParent(nativeEvent: any) {
		if (nativeEvent.source !== (window as any).parent) {
			return;
		}
		const event = nativeEvent.data as PostMessageEvent;
		switch (event.type) {
			case 'match-select':
				handleBroadcastMatchSelect(event);
				break;
			case 'match-jump':
				handleMatchJump(event);
				break;
			case 'zoom':
				if (event.zoomIn) zoomIn();
				else zoomOut();
				break;
			default:
				console.error('unknown event in source frame', nativeEvent);
		}
	}

	/**
	 * Handle a match-jump event
	 * @param event the match-jump event object
	 */
	function handleMatchJump(event: MatchJumpEvent) {
		// cases:
		// nothing is marked - force the start

		if (!current) {
			handleMatchSelect(matches[0], true);
			return;
		}

		// start is marked and backward  -  do nothing
		// end is marked and forward - do nothing
		const oldGid = current.dataset['gid'];
		const firstGid = matches[0].dataset['gid'];
		const lastGid = matches[matches.length - 1].dataset['gid'];
		if ((oldGid === firstGid && !event.forward) || (oldGid === lastGid && event.forward)) {
			return;
		}

		// middle is marked - just go next/prev
		let currentIndex = matches.indexOf(current);
		const step = event.forward ? 1 : -1;
		while (0 <= currentIndex && currentIndex < matches.length) {
			currentIndex += step;
			if (matches[currentIndex].dataset['gid'] !== oldGid) {
				break;
			}
		}
		const nextGid = matches[currentIndex].dataset['gid'];
		handleMatchSelect(groups[nextGid as keyof HTMLSpanElement][0], true);
	}

	/**
	 * Emit events to parent using postMessage API
	 * @param event the event to emit
	 */
	function messageParent(event: PostMessageEvent) {
		(window as any).parent.postMessage(event, '*');
	}

	/**
	 * Handle a click on a match element
	 * @param event the default mouse event
	 */
	function onMatchClick(event: MouseEvent) {
		const elem = event.target as HTMLSpanElement;
		handleMatchSelect(elem, true);
	}

	/**
	 * handle a broadcasted `match-select` event
	 * @param event the match select event
	 */
	function handleBroadcastMatchSelect(event: MatchSelectEvent) {
		const elem = document.querySelector<HTMLSpanElement>(`span[match][data-index='${event.index}']`);
		if (!elem && event.index !== -1) {
			messageParent({ type: 'match-warn' });
		}
		handleMatchSelect(elem || current, false); // should not rebroadcast
	}

	/**
	 * Handles match selection that was requested programmatically or by user click
	 * @param elem the element that was selected
	 * @param broadcast a flag indicating wether to message the suspect frame about this element being selected
	 */
	function handleMatchSelect(elem: HTMLSpanElement | null, broadcast: boolean = false): void {
		if (current && current.dataset['gid'] === elem?.dataset['gid']) {
			groups[current.dataset['gid'] as keyof HTMLSpanElement].forEach(el => el.toggleAttribute('on', false));
			current = null;
			if (broadcast) {
				messageParent({ type: 'match-select', index: -1 });
			}
			return;
		}
		if (current) {
			groups[current.dataset['gid'] as keyof HTMLSpanElement].forEach(el => el.toggleAttribute('on', false));
		}
		if (elem) {
			groups[elem.dataset['gid'] as keyof HTMLSpanElement].forEach(el => el.toggleAttribute('on', true));
			if (isPdf) {
				elem?.closest('.pc')?.classList.add('opened');
			}
			elem.scrollIntoView();
		}
		current = elem;
		if (broadcast) {
			messageParent({ type: 'match-select', index: +(current?.dataset?.['index'] ?? '') });
		}
	}

	/**
	 * Handle match hover event
	 * @param event the default mouse event
	 */
	function onMatchHover(event: MouseEvent) {
		const elem = event?.target as HTMLSpanElement;
		groups[elem?.dataset['gid'] as keyof HTMLSpanElement]?.forEach(el => el?.classList?.toggle('hover'));
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
		document.body.style.setProperty('zoom', String(currentZoom));
		if (isPdf) {
			// for pdf the scale doesn't work for the html or body elements, because the divs in the pdf are all with absolute positioning
			let pageContainer = document.querySelector('#page-container') as HTMLElement;
			let sidebar = document.querySelector('#sidebar') as HTMLElement;
			if (pageContainer) {
				// Apply the transformations and update width and height using percentages
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
}

export default `(${onDocumentReady.toString()})(${ready.toString()})`;

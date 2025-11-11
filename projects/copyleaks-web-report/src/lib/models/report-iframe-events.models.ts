/** Type representing an event that fired inside of an iframe containing a scan html content */
export type PostMessageEvent =
	| MatchClickEvent
	| MatchJumpEvent
	| MatchSelectEvent
	| MatchWarnEvent
	| UpgradePlanEvent
	| ZoomEvent
	| MultiMatchSelectEvent
	| CorrectionSelectEvent
	| MatchesRefreshEvent
	| MatchGroupSelectEvent
	| ScrollPositionEvent
	| SetScrollEvent
	| GetScrollEvent;

/** base type of post message event */
interface BasePostMessageEvent {
	/** the name of the event */
	type: string;
}

/** Event type indicating a match was selected */
export interface MatchSelectEvent extends BasePostMessageEvent {
	type: 'match-select';
	/** the index of the match that was selected */
	index: number;
	/** the previous index of the match that was deselected */
	prevIndex?: number;
}

/** Event type indicating a group of matches was selected */
export interface MatchGroupSelectEvent extends BasePostMessageEvent {
	type: 'match-group-select';
	/** the id of the group that was selected */
	groupId: number;
}

/** Event type indicating a multiple matches were selected */
export interface MultiMatchSelectEvent extends BasePostMessageEvent {
	type: 'multi-match-select';
	/** the indexes of all the matches that were selected */
	indexes: number[];
}

/** Event type indicating a match was clicked */
export interface MatchClickEvent extends BasePostMessageEvent {
	type: 'match-click';
	/** the index of the match that was clicked */
	index: number;
}
/** Event type indicating a match jump was requested */

export interface MatchJumpEvent extends BasePostMessageEvent {
	type: 'match-jump';
	/** the direction of the jump */
	forward: boolean;
}

/** Event type indicating a something has gone wrong */
export interface MatchWarnEvent extends BasePostMessageEvent {
	type: 'match-warn';
	/** possible payload of the event */
	payload?: any;
}
export interface UpgradePlanEvent extends BasePostMessageEvent {
	type: 'upgrade-plan';
}
export interface MatchesRefreshEvent extends BasePostMessageEvent {
	type: 'matches-refresh';
}

export interface ZoomEvent extends BasePostMessageEvent {
	type: 'zoom';
	zoomIn: boolean;
}

export interface CorrectionSelectEvent extends BasePostMessageEvent {
	type: 'correction-select';
	/** the index of the match that was selected */
	gid: number;
}

/** Event type indicating scroll position update from iframe */
export interface ScrollPositionEvent extends BasePostMessageEvent {
	type: 'scrollPosition';
	/** the scroll top position */
	scrollTop: number;
	/** the scroll left position */
	scrollLeft: number;
}

/** Event type indicating a request to set scroll position in iframe */
export interface SetScrollEvent extends BasePostMessageEvent {
	type: 'setScroll';
	/** the scroll top position to set */
	scrollTop: number;
	/** the scroll left position to set */
	scrollLeft: number;
}

/** Event type indicating a request to get current scroll position from iframe */
export interface GetScrollEvent extends BasePostMessageEvent {
	type: 'getScroll';
}

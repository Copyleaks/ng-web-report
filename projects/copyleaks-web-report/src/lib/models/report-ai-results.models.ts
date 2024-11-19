import { Range } from './report-matches.models';

export interface IResourceStartExplainableAIVideo {
	startVideo: boolean;
	link: string;
}

export interface ISelectExplainableAIResult {
	resultRange: Range;
	isSelected: boolean;
}

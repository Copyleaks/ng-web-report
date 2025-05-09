import {
	AIMatch,
	AIScanResult,
	AIScanResultMatch,
	ComparisonKey,
	ContentKey,
	EndpointKind,
	EProportionType,
	Match,
	MatchEndpoint,
	MatchType,
	ResultDetailItem,
	SlicedMatch,
	SubjectResultKey,
} from '../models/report-matches.models';
import {
	Comparison,
	ICompleteResultNotificationAlert,
	IScanSource,
	IWritingFeedbackScanScource,
} from '../models/report-data.models';

import { ICopyleaksReportOptions } from '../models/report-options.models';
import { EExcludeReason, EMatchClassification } from '../enums/copyleaks-web-report.enums';
import { EXCLUDE_MESSAGE } from '../constants/report-exclude.constants';

/** A reduce function to extrace `MatchEndpoint`s */
const extractMatchEndpoints = (acc: MatchEndpoint[], curr: Match): MatchEndpoint[] => {
	acc.push({
		index: curr.start,
		type: curr.type,
		kind: EndpointKind.start,
		ids: [...(curr.ids ?? [])],
		gid: curr.gid,
		reason: curr.reason,
	});
	acc.push({
		index: curr.end,
		type: curr.type,
		kind: EndpointKind.end,
		ids: [...(curr.ids ?? [])],
		gid: curr.gid,
		reason: curr.reason,
	});
	return acc;
};

/**
 * Takes a list of matches and push the missing gaps as matches with type of MatchType.none
 */
export const fillMissingGaps = (intervals: Match[], length: number): Match[] => {
	let start = 0;
	const end = length;
	if (intervals.length === 0) {
		return [{ start, end, type: MatchType.none }];
	}
	for (let i = 0; i < intervals.length; i++) {
		const current = intervals[i];
		if (start < current.start) {
			intervals.splice(i, 0, { start, end: current.start, type: MatchType.none });
			i++;
		}
		start = current.end;
	}
	const last = intervals[intervals.length - 1];
	if (intervals[intervals.length - 1].end < end) {
		intervals.push({ start: last.end || 0, end, type: MatchType.none });
	}
	return intervals;
};

/**
 * divide a list of `matches` into nests of none distinct ranges
 * @param matches the base `matches` to process
 */
export const findNests = (matches: Match[]): Match[][] => {
	if (matches.length === 0) {
		return [];
	}
	matches.sort((a, b) => a.start - b.start || a.end - b.end || a.type - b.type);
	const nests: Match[][] = [[matches[0]]];
	let nestFurthestEnd = matches[0].end;
	let nestFurthestReason = matches[0].reason;

	for (const interval of matches.slice(1)) {
		if (
			interval.start > nestFurthestEnd ||
			(interval.start === nestFurthestEnd && interval.reason !== nestFurthestReason)
		) {
			nests.push([interval]);
			nestFurthestEnd = interval.end;
		} else {
			nests[nests.length - 1].push(interval);
			nestFurthestEnd = Math.max(nestFurthestEnd, interval.end);
		}
		nestFurthestReason = interval.reason;
	}
	return nests;
};

/**
 * merge the overlapping ranges (matches) within a list of none distinct ranges
 * preserving the match ids and deciding the match type based on priority
 * @param matches the matches to merge - should not include distinct ranges (gaps)
 */
const mergeMatchesInNest = (matches: Match[]): Match[] => {
	const uniqueMatches = matches.slice(1).reduce(
		(prev: Match[], curr: Match) => {
			const last = prev[prev.length - 1];
			if (last.start === curr.start && last.end === curr.end) {
				last.type = Math.min(last.type, curr.type);
				if (curr.ids?.length != undefined && curr.ids?.length != 0 && last.ids?.indexOf(curr.ids[0]) === -1) {
					last.ids.push(curr.ids[0]);
				}
			} else {
				prev.push(curr);
			}
			return prev;
		},
		[matches[0]]
	);

	const endpoints = uniqueMatches
		.reduce(extractMatchEndpoints, [])
		.sort((a, b) => a.index - b.index || b.kind - a.kind);

	const subMatches: Match[] = [];
	const idMap: { [key: string]: number } = {};
	const types: number[] = [0, 0, 0, 0, 0, 0, 0];
	let start: number | undefined = undefined;
	for (const { index, type, ids, kind, gid, reason } of endpoints) {
		if (kind === EndpointKind.start) {
			if (start) {
				if (index !== start) {
					const participatingIds = Object.entries(idMap)
						.filter(([, value]) => value > 0)
						.map(([key]) => key);
					subMatches.push({
						start,
						end: index,
						type: types.findIndex(x => x > 0),
						ids: participatingIds,
						gid,
						reason,
						writingFeedbackType:
							uniqueMatches.find(um => um.start === start && um.type === MatchType.writingFeedback)
								?.writingFeedbackType ?? undefined,
						proportionType: matches[0]?.proportionType,
					});
				}
			}
			ids?.forEach(id => (idMap[id] = (idMap[id] || 0) + 1));
			types[type]++;
			start = index;
		}
		if (kind === EndpointKind.end) {
			if (index !== start) {
				const participatingIds = Object.entries(idMap)
					.filter(([, value]) => value > 0)
					.map(([key]) => key);
				subMatches.push({
					start: start ?? 0,
					end: index,
					type: types.findIndex(x => x > 0),
					ids: participatingIds,
					gid,
					reason,
					writingFeedbackType:
						uniqueMatches.find(um => um.start === start && um.type === MatchType.writingFeedback)
							?.writingFeedbackType ?? undefined,
					proportionType: matches[0]?.proportionType,
				});
			}
			ids?.forEach(id => (idMap[id] = (idMap[id] || 0) - 1));
			types[type]--;
			start = Object.entries(idMap).filter(([, value]) => value > 0).length === 0 ? undefined : index;
		}
	}

	const result: Match[] = subMatches.slice(1).reduce(
		(prev: Match[], curr: Match) => {
			const last = prev[prev.length - 1];

			if (
				last.type != MatchType.writingFeedback &&
				last.type === curr.type &&
				curr.ids?.sort().join(',') === last.ids?.sort().join(',')
			) {
				last.end = curr.end;
			} else {
				prev.push(curr);
			}
			return prev;
		},
		[subMatches[0]]
	);
	return result;
};

/**
 * merge a list of matches , removing overlaps while preserving the match attributes
 * @param matches the list of matches
 */
export const mergeMatches = (matches: Match[]): Match[] => {
	const nests = findNests(matches);
	const merged = nests.reduce((prev: Match[], nest: Match[]) => {
		if (nest[0].start == nest[0].end) {
			return prev;
		} else {
			const joined = mergeMatchesInNest(nest);
			return prev.concat(joined);
		}
	}, []);
	return merged;
};

/**
 * split `content` according to the given `matches` the result should contain a list of matches
 * for every page according to `pages`
 * @param content a string representing scan **text** or **html**
 * @param pages an array where every element is a start position of a page
 * @param matches `matches` containing the data to slice the `content`
 */
export const paginateMatches = (content: string, pages: number[], matches: Match[]): SlicedMatch[][] => {
	const result: SlicedMatch[][] = [[]];
	let page = 0;
	for (let match of matches) {
		if (match.start >= pages[page + 1]) {
			page++;
			result[page] = [];
		}
		if (match.end < pages[page + 1]) {
			result[page].push({ content: content.slice(match.start, match.end), match });
		} else {
			while (match.end > pages[page + 1]) {
				const complement = { ...match, start: pages[page + 1] };
				match.end = pages[page + 1] - 1;
				result[page].push({ content: content.slice(match.start, match.end), match });
				match = complement;
				page++;
				result[page] = [];
			}
			result[page].push({ content: content.slice(match.start, match.end), match });
		}
	}
	return result;
};

/**
 * Higher order function that returns a function that extracts Match Intervals from a Result
 * @param comparison name of the comparison type to extract ( identical | minorChanges | relatedMeaning)
 * @param content name of the content to extract from ( text | html )
 * @param subject name of the subject to extract from ( source | suspected)
 */
const extractMatches =
	(comparison: ComparisonKey, content: ContentKey, subject: SubjectResultKey) => (item: ResultDetailItem) => {
		const { result, id } = item;
		if (!result || !result[content] || !result[content].comparison) {
			return [];
		}
		const gids = result[content].comparison[comparison].groupId || [];
		const { starts, lengths } = result[content].comparison[comparison][subject].chars;
		return starts.map(
			(start, i): Match => ({
				start,
				end: start + lengths[i],
				type: MatchType[comparison],
				ids: [id],
				gid: gids[i],
			})
		);
	};

/**
 * Higher order function that returns a function that extracts Excluded intervals from the source document
 * @param content name of the content to extract from (text | html)
 */
const extractExcluded = (content: ContentKey) => (source: IScanSource) => {
	if (!source?.[content]?.exclude) {
		return [];
	}
	const { starts, lengths, groupIds, reasons } = source[content]?.exclude;
	return starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i],
			type: MatchType.excluded,
			reason: reasons[i],
			ids: [],
			gid: groupIds ? groupIds[i] : undefined,
		})
	);
};

/** A function to extract `identical` matches from the `text` of a `source` document */
export const sourceTextIdentical = extractMatches('identical', 'text', 'source');

/** A function to extract `relatedMeaning` matches from the `text` of a `source` document */
export const sourceTextRelatedMeaning = extractMatches('relatedMeaning', 'text', 'source');

/** A function to extract `minorChanges` matches from the `text` of a `source` document */
export const sourceTextMinorChanges = extractMatches('minorChanges', 'text', 'source');

/** A function to extract `identical` matches from the `html` of a `source` document */
export const sourceHtmlIdentical = extractMatches('identical', 'html', 'source');

/** A function to extract `relatedMeaning` matches from the `html` of a `source` document */
export const sourceHtmlRelatedMeaning = extractMatches('relatedMeaning', 'html', 'source');

/** A function to extract `minorChanges` matches from the `html` of a `source` document */
export const sourceHtmlMinorChanges = extractMatches('minorChanges', 'html', 'source');

/** A function to extract `identical` matches from the `text` of a `suspect` document */
export const suspectTextIdentical = extractMatches('identical', 'text', 'suspected');

/** A function to extract `relatedMeaning` matches from the `text` of a `suspect` document */
export const suspectTextRelatedMeaning = extractMatches('relatedMeaning', 'text', 'suspected');

/** A function to extract `minorChanges` matches from the `text` of a `suspect` document */
export const suspectTextMinorChanges = extractMatches('minorChanges', 'text', 'suspected');

/** A function to extract `identical` matches from the `html` of a `suspect` document */
export const suspectHtmlIdentical = extractMatches('identical', 'html', 'suspected');

/** A function to extract `relatedMeaning` matches from the `html` of a `suspect` document */
export const suspectHtmlRelatedMeaning = extractMatches('relatedMeaning', 'html', 'suspected');

/** A function to extract `minorChanges` matches from the `html` of a `suspect` document */
export const suspectHtmlMinorChanges = extractMatches('minorChanges', 'html', 'suspected');

/** A function to extract `excluded` matches from the `text` of a `source` document */
export const sourceTextExcluded = extractExcluded('text');

/** A function to extract `excluded` matches from the `html` of a `source` document */
export const sourceHtmlExcluded = extractExcluded('html');

/**
 * Locate the respective match start index for a given index in the given comparison.
 * If `fromSource` is set to true, the initial index is assumed to be from the comparison source
 * and therefore will search in the respective `ComparisonData`. Returns a tuple of two indices
 * where the first number is start index of the respective match, and the second is the start index
 * of the closest match to the initially given index
 * @param index a position on the text/html that covers a match
 * @param comparison comparison relevant to the match type and associated content
 * @param fromSource flag indicating that `index` is coming from the source suspect
 */
export const findRespectiveStart = (index: number, comparison: Comparison, fromSource = true): [number, number] => {
	const { source, suspected } = comparison;
	const [from, to] = fromSource ? [source, suspected] : [suspected, source];
	const found = from.chars.starts.findIndex((s, i) => s <= index && index <= s + source.chars.lengths[i]);
	return [to.chars.starts[found], from.chars.starts[found]];
};

export const processCorrectionsText = (
	corrections: IWritingFeedbackScanScource,
	content: ContentKey,
	source: IScanSource
) => {
	if (!corrections || !corrections[content]) return [];

	const gids = content === 'html' ? corrections[content].chars.groupIds : [];
	const { starts, lengths, types } = corrections[content].chars;
	const extractedCorrections = starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i],
			type: MatchType.writingFeedback,
			gid: gids[i],
			writingFeedbackType: types[i],
		})
	);

	const excluded = []; // ! temprorarily ignored the excluded for writing feedback scan
	const grouped = mergeMatches([...extractedCorrections, ...excluded]);
	const filled = fillMissingGaps(grouped, source.text.value.length);
	return paginateMatches(source.text.value, source.text.pages.startPosition, filled);
};

export const processCorrectionsHtml = (
	corrections: IWritingFeedbackScanScource,
	content: ContentKey,
	source: IScanSource
) => {
	if (!corrections || !corrections[content]) return [];
	const gids = content === 'html' ? corrections[content].chars.groupIds : [];
	const { starts, lengths, types } = corrections[content].chars;
	const extractedCorrections = starts.map(
		(start, i): Match => ({
			start,
			end: start + lengths[i],
			type: MatchType.writingFeedback,
			gid: gids[i],
			writingFeedbackType: types[i],
			ids: [],
		})
	);
	const excluded = []; // ! temprorarily ignored the excluded for writing feedback scan
	const grouped = mergeMatches([...extractedCorrections, ...excluded]);
	const filled = fillMissingGaps(grouped, source.html?.value?.length);

	return filled;
};

/**
 * This function will process one or more results and generate a list of match intervals that will help
 * highlight the source html with respect to user settings and match type priority
 * @param results one or more result item on which the calculation will be based on
 * @param settings the current user settings
 * @param source the scan source
 * @param text `true` if calculation should base on text comparison, `false` for html
 */
export const processSourceText = (
	results: ResultDetailItem | ResultDetailItem[],
	settings: ICopyleaksReportOptions,
	source: IScanSource,
	text: boolean = true
) => {
	const items = Array.isArray(results) ? results : [results]; // Type guard
	const identical = settings.showIdentical
		? items.reduce((acc: Match[], res) => acc.concat((text ? sourceTextIdentical : sourceHtmlIdentical)(res)), [])
		: [];
	const minor = settings.showMinorChanges
		? items.reduce((acc: Match[], res) => acc.concat((text ? sourceTextMinorChanges : sourceHtmlMinorChanges)(res)), [])
		: [];
	const related = settings.showRelated
		? items.reduce(
				(acc: Match[], res) => acc.concat((text ? sourceTextRelatedMeaning : sourceHtmlRelatedMeaning)(res)),
				[]
		  )
		: [];
	const excluded = sourceTextExcluded(source);
	const grouped = mergeMatches([...identical, ...minor, ...related, ...excluded]);
	const filled = fillMissingGaps(grouped, source.text.value.length);
	return paginateMatches(source.text.value, source.text.pages.startPosition, filled);
};

/**
 * This function will process notifications and generate a list of match intervals that will help
 * highlight the source text.
 * @param source the scan source
 * @param alertToMatch alert to process
 */
export const processSuspectedCharacterMatches = (
	source: IScanSource,
	alertToMatch: ICompleteResultNotificationAlert
): SlicedMatch[][] => {
	const matches: Match[] = [];
	const data: {
		starts: number[];
		lengths: number[];
	} = JSON.parse(alertToMatch.additionalData);
	if (data && data.starts && data.lengths) {
		for (let i = 0; i < data.starts.length; i++) {
			matches.push({
				start: data.starts[i],
				end: data.starts[i] + data.lengths[i],
				type: MatchType.suspectedCharacterReplacement,
				ids: [],
			});
		}
	}

	const grouped = matches;
	const filled = fillMissingGaps(grouped, source.text.value.length);
	return paginateMatches(source.text.value, source.text.pages.startPosition, filled);
};

/**
 * This function will process notifications and generate a list of match intervals that will help
 * highlight the source text.
 * @param source the scan source
 * @param alertToMatch alert to process
 */
export const processAIInsightsTextMatches = (
	source: IScanSource,
	alertToMatch: ICompleteResultNotificationAlert,
	showAIPhrases: boolean = false
): SlicedMatch[][] => {
	const matches: Match[] = [];
	let lastExplainIndex = 0;

	const scanResult = JSON.parse(alertToMatch.additionalData) as AIScanResult;
	const explainResult = showAIPhrases ? scanResult?.explain : null;
	const lengthExplain = explainResult?.patterns?.text?.chars?.starts?.length ?? 0;
	const proportionArray = explainResult
		? updateExplainProportionType(explainResult.patterns.statistics.proportion)
		: [];

	// Process each result and match
	scanResult?.results?.forEach(result => {
		result?.matches?.forEach((match: AIScanResultMatch) => {
			// Map raw matches
			const mappedMatches =
				match?.text?.chars?.starts?.map((start, idx) => ({
					start,
					end: start + match.text.chars.lengths[idx],
					type: result.classification === EMatchClassification.AI ? MatchType.aiText : MatchType.none,
					ids: [],
					classification: result.classification,
					probability: result.probability,
					totalWords: match.text.words.lengths[idx],
				})) ?? [];

			// Process each mapped match
			mappedMatches.forEach(mappedMatch => {
				if (mappedMatch.type === MatchType.aiText && lastExplainIndex < lengthExplain) {
					let startMapped = mappedMatch.start;
					let endMapped = mappedMatch.end;

					// Handle AI insights within the match
					while (lastExplainIndex < lengthExplain) {
						const explainStart = explainResult?.patterns?.text?.chars?.starts[lastExplainIndex];
						const explainEnd = explainStart + (explainResult?.patterns?.text?.chars?.lengths[lastExplainIndex] ?? 0);

						if (startMapped > explainEnd) {
							lastExplainIndex++;
							continue; // Skip irrelevant explanations
						}

						if (endMapped < explainStart) {
							break; // No more relevant explanations
						}

						// Add match before the insight if necessary
						if (startMapped < explainStart) {
							matches.push(createMatch(mappedMatch, startMapped, explainStart - 1));
							startMapped = explainStart;
						}

						// Add the AI insight
						matches.push(createExplainMatch(mappedMatch, explainStart, explainEnd, proportionArray[lastExplainIndex]));
						startMapped = explainEnd + 1;

						lastExplainIndex++;
					}

					// Add remaining part of the match after all insights
					if (startMapped < endMapped) {
						matches.push(createMatch(mappedMatch, startMapped, endMapped));
					}
				} else {
					matches.push(mappedMatch); // Add non-AI matches directly
				}
			});
		});
	});

	// Handle excluded regions and gaps
	const excluded = sourceTextExcluded(source);
	const grouped = mergeMatches([...matches, ...excluded]);
	const filled = fillMissingGaps(grouped, source.text.value.length);

	// Paginate the matches
	return paginateMatches(source.text.value, source.text.pages.startPosition, filled);
};

/**
 * Creates a generic match segment.
 */
const createMatch = (baseMatch: Match, start: number, end: number): Match => ({
	...baseMatch,
	start,
	end,
});

/**
 * Creates an AI explain match segment.
 */
const createExplainMatch = (baseMatch: Match, start: number, end: number, proportionType: EProportionType): Match => ({
	...baseMatch,
	start,
	end,
	type: MatchType.aiExplain,
	proportionType,
});

/**
 * This function will process notifications and generate a list of match intervals that will help
 * highlight the source text.
 * @param source the scan source
 * @param alertToMatch alert to process
 */
export const processAIInsightsHTMLMatches = (
	source: IScanSource,
	alertToMatch: ICompleteResultNotificationAlert,
	showAIPhrases: boolean = false
): Match[] => {
	const matches: Match[] = [];
	let lastExplainIndex: number = 0;
	var scanResult = JSON.parse(alertToMatch.additionalData) as AIScanResult;
	const explainResult = showAIPhrases ? scanResult?.explain ?? false : false;
	const lengthExplain = explainResult ? explainResult?.patterns?.html?.chars?.starts?.length : 0;
	const proportionArray = explainResult
		? updateExplainProportionType(explainResult?.patterns?.statistics?.proportion)
		: [];

	scanResult?.results?.forEach(result => {
		result?.matches?.forEach((match: AIScanResultMatch) => {
			const mappedMatches = match?.html?.chars?.starts?.map(
				(start, idx) =>
					({
						start,
						end: start + match.html.chars.lengths[idx],
						type: result.classification == EMatchClassification.AI ? MatchType.aiText : MatchType.none,
						ids: [],
						classification: result.classification,
						probability: result.probability,
						totalWords: match.html.words.lengths[idx],
						gid: -1,
					} as AIMatch)
			);
			//#region add explain to the matches
			mappedMatches?.forEach(match => {
				if (match && match.type == MatchType.aiText && lastExplainIndex < lengthExplain) {
					let startMappedMatches = match.start;
					let endMappedMatches = match.end;
					for (let i = lastExplainIndex; i < lengthExplain; i++) {
						const firstExolain = scanResult?.explain?.patterns?.html?.chars?.starts[i];
						const endExolain = firstExolain + scanResult.explain?.patterns?.html?.chars?.lengths[i];
						if (startMappedMatches <= firstExolain && endMappedMatches >= endExolain) {
							lastExplainIndex = i + 1;
							if (startMappedMatches < firstExolain) {
								const matchBefore = {
									start: startMappedMatches,
									end: firstExolain - 1,
									type: match.type,
									ids: [],
									gid: match.gid,
									classification: match.classification,
									probability: match.probability,
									totalWords: match.totalWords,
								} as AIMatch;
								matches.push(matchBefore);
								startMappedMatches = firstExolain;
								i = i - 1;
							} else if (startMappedMatches == firstExolain) {
								const explainMatch = {
									start: firstExolain,
									end: endExolain,
									type: MatchType.aiExplain,
									ids: [],
									gid: scanResult?.explain?.patterns?.html?.chars?.groupIds[i],
									classification: match.classification,
									probability: match.probability,
									totalWords: match.totalWords,
									proportionType: proportionArray[scanResult?.explain?.patterns?.html?.chars?.groupIds[i]],
								} as AIMatch;
								matches.push(explainMatch);
								startMappedMatches = endExolain + 1;
							}
						}
					}
					if (startMappedMatches < endMappedMatches) {
						const matchAfter = {
							start: startMappedMatches,
							end: endMappedMatches,
							type: match.type,
							ids: [],
							classification: match.classification,
							probability: match.probability,
							totalWords: match.totalWords,
							gid: match.gid,
						} as AIMatch;
						matches.push(matchAfter);
					}
				} else if (match) {
					matches.push(match);
				}
			});
			//#endregion
		});
	});

	const excluded = sourceHtmlExcluded(source);
	const grouped = mergeMatches([...matches, ...excluded]);
	const final = fillMissingGaps(grouped, source.html?.value?.length);
	return final;
};

export const updateExplainProportionType = (proportionArray: number[]) => {
	let proportionArrayType: EProportionType[] = [];
	if (proportionArray.length == 0) {
		return proportionArrayType;
	}
	const positiveValues = proportionArray.filter(value => value > 0);
	const min = Math.min(...positiveValues);
	const max = Math.max(...proportionArray);
	const divider = (max - min) / 3;
	proportionArray.forEach(value => {
		if (value == -1) {
			proportionArrayType.push(EProportionType.High);
		} else if (min <= value && value < divider) {
			proportionArrayType.push(EProportionType.Low);
		} else if (divider <= value && value < divider * 2) {
			proportionArrayType.push(EProportionType.Medium);
		} else if (divider * 2 <= value && value <= max) {
			proportionArrayType.push(EProportionType.High);
		}
	});
	return proportionArrayType;
};

/**
 * This function will process one result and generate a list of match intervals that will help
 * highlight the suspect text with respect to user options and match type priority
 * @param suspect the suspect result item
 * @param options the current user options
 * @param text `true` if calculation should base on text comparison, `false` for html
 */
export const processSuspectText = (
	suspect: ResultDetailItem,
	options: ICopyleaksReportOptions,
	text: boolean = true
): SlicedMatch[][] => {
	const identical = options.showIdentical ? (text ? suspectTextIdentical : suspectHtmlIdentical)(suspect) : [];
	const minor = options.showMinorChanges ? (text ? suspectTextMinorChanges : suspectHtmlMinorChanges)(suspect) : [];
	const related = options.showRelated ? (text ? suspectTextRelatedMeaning : suspectHtmlRelatedMeaning)(suspect) : [];
	const grouped = mergeMatches([...identical, ...minor, ...related]);
	const filled = fillMissingGaps(grouped, suspect?.result?.text?.value?.length ?? 0);
	const final = paginateMatches(
		suspect?.result?.text?.value ?? '',
		suspect?.result?.text?.pages?.startPosition ?? [],
		filled
	);
	return final;
};

/**
 * This function will process one or more results and generate a list of match intervals that will help
 * highlight the source html with respect to user options and match type priority
 * @param results one or more result item on which the calculation will be based on
 * @param options the current user options
 * @param source the scan source
 */
export const processSourceHtml = (
	results: ResultDetailItem | ResultDetailItem[],
	options: ICopyleaksReportOptions,
	source: IScanSource
) => {
	if (!source || !source.html) {
		return null;
	}
	const items = Array.isArray(results) ? results : [results]; // Type guard
	const identical = options.showIdentical
		? items.reduce((acc: Match[], res) => acc.concat(sourceHtmlIdentical(res)), [])
		: [];
	const minor = options.showMinorChanges
		? items.reduce((acc: Match[], res) => acc.concat(sourceHtmlMinorChanges(res)), [])
		: [];
	const related = options.showRelated
		? items.reduce((acc: Match[], res) => acc.concat(sourceHtmlRelatedMeaning(res)), [])
		: [];
	const excluded = sourceHtmlExcluded(source);
	const grouped = mergeMatches([...identical, ...minor, ...related, ...excluded]);
	const final = fillMissingGaps(grouped, source.html?.value?.length);
	return final;
};

/**
 * This function will process one result and generate a list of match intervals that
 * will help highlight the suspect html with respect to user options and match type priority
 * @param suspect the suspect result item
 * @param options the current user options
 */
export const processSuspectHtml = (suspect: ResultDetailItem, options: ICopyleaksReportOptions): Match[] | null => {
	if (!suspect || !suspect?.result?.html) {
		return null;
	}
	const identical = options.showIdentical ? suspectHtmlIdentical(suspect) : [];
	const minor = options.showMinorChanges ? suspectHtmlMinorChanges(suspect) : [];
	const related = options.showRelated ? suspectHtmlRelatedMeaning(suspect) : [];
	const grouped = mergeMatches([...identical, ...minor, ...related]);
	return fillMissingGaps(grouped, suspect.result?.html.value?.length ?? 0);
};

/**
 * Render list of matches in the iframe's HTML
 * @param matches the matches to render
 */
export const getRenderedMatches = (matches: Match[] | null, originalHtml: string): string | null => {
	if (!matches || !originalHtml) return originalHtml;

	// Add the matches to the html and return the updated html

	//#region old code
	// const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
	// 	let slice = originalHtml?.substring(curr.start, curr.end);
	// 	switch (curr.type) {
	// 		case MatchType.excluded:
	// 			var reason = curr.reason != undefined && curr.reason != null ? EXCLUDE_MESSAGE[curr.reason] : null;
	// 			if (curr.reason === EExcludeReason.PartialScan) {
	// 				slice = `<span exclude-partial-scan data-type="${curr.type}" data-index="${i}" title="${reason}">${slice}</span>`;
	// 			} else {
	// 				if (reason) slice = `<span exclude title="${reason}">${slice}</span>`;
	// 				else slice = `<span exclude title="UnKnown">${slice}</span>`;
	// 			}
	// 			break;
	// 		case MatchType.none:
	// 			break;
	// 		default:
	// 			if (curr.type === MatchType.writingFeedback) {
	// 				slice = `<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}" data-correction-text="${curr.correctionText}" data-wrong-text="${curr.wrongText}">${slice}</span>`;
	// 			} else slice = `<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}">${slice}</span>`;
	// 			break;
	// 	}
	// 	return slice ? slice?.concat(prev) : '';
	// }, '');
	//#endregion old code

	const stringBuilder: string[] = [];
	let lastIndex = 0;

	matches.forEach((curr: Match, i: number) => {
		// Add the part of the original HTML before the current match
		if (curr.start > lastIndex) {
			stringBuilder.push(originalHtml?.substring(lastIndex, curr.start));
		}

		let slice = originalHtml?.substring(curr.start, curr.end);
		switch (curr.type) {
			case MatchType.excluded:
				const reason = curr.reason != undefined && curr.reason != null ? EXCLUDE_MESSAGE[curr.reason] : null;
				if (curr.reason === EExcludeReason.PartialScan) {
					stringBuilder.push(
						`<span exclude-partial-scan data-type="${curr.type}" data-index="${i}" title="${reason}">${slice}</span>`
					);
				} else {
					if (reason) {
						stringBuilder.push(
							`<span exclude class="copyleaks-custom-tooltip-trigger" data-tooltip="${reason}">${slice}<div class="copyleaks-custom-tooltip">${reason}</div></span>`
						);
					} else {
						stringBuilder.push(
							`<span exclude class="copyleaks-custom-tooltip-trigger" data-tooltip="UnKnown">${slice}<div class="copyleaks-custom-tooltip">UnKnown</div></span>`
						);
					}
				}
				break;
			case MatchType.none:
				stringBuilder.push(slice);
				break;
			default:
				if (curr.type === MatchType.writingFeedback) {
					stringBuilder.push(
						`<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}" data-correction-text="${curr.correctionText}" data-wrong-text="${curr.wrongText}">${slice}</span>`
					);
				} else if (curr.type === MatchType.aiExplain) {
					stringBuilder.push(
						`<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}" data-proportion="${curr.proportionType}">${slice}</span>`
					);
				} else {
					stringBuilder.push(
						`<span match data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}">${slice}</span>`
					);
				}
				break;
		}

		lastIndex = curr.end;
	});

	// Add the remaining part of the original HTML after the last match
	if (lastIndex < originalHtml?.length) {
		stringBuilder.push(originalHtml?.substring(lastIndex));
	}

	const html = stringBuilder.join('');

	return html;
};

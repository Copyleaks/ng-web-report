import { ALERTS } from '../constants/report-alerts.constants';
import { EWritingFeedbackTypes } from '../enums/copyleaks-web-report.enums';
import {
	ICompleteResults,
	IWritingFeedbackCorrections,
	IWritingFeedbackScanScource,
	IWritingFeedbackScore,
} from '../models/report-data.models';
import {
	AIScanResult,
	AIScanResultSummary,
	ComparisonKey,
	Match,
	MatchType,
	ResultDetailItem,
	SubjectResultKey,
	WritingFeedbackScanResultSummary,
} from '../models/report-matches.models';
import { ICopyleaksReportOptions } from '../models/report-options.models';
import { ReportStatistics } from '../models/report-statistics.models';
import { getSelectedCategoryType } from './enums-helpers';

/**
 * Higher order function that returns a function that extracts Match Intervals from a Result
 * @param type name of the match type to extract ( identical | minorChanges | relatedMeaning)
 * @param subject name of the subject to extract from ( source | suspected)
 */
export const createWordIntervalsFrom =
	(type: ComparisonKey, subject: SubjectResultKey) =>
	({ result }: ResultDetailItem) => {
		if (!result) {
			return [];
		}
		const { starts, lengths } = result.text.comparison[type][subject].words;
		return starts.map(
			(start, i): Match => ({
				start,
				end: start + lengths[i] + 1,
				type: MatchType[type],
			})
		);
	};

/**
 * merge consecutive intervals based on start and end index
 * while prioritizing type ( lower is better )
 * this function assumes all intervals are non-distinct (has no gaps)
 */
export const mergeWordIntervals = (matches: Match[]): Match[] =>
	matches.reduce((joined: Match[], next: Match) => {
		if (joined.length === 0) {
			joined.push(next);
			return joined;
		}
		const prev = joined[joined.length - 1];

		// equal points
		// [---p---]
		// [---n---]
		if (prev.end === next.end && prev.start === next.start) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, type: next.type };
			}
		}
		// same start inclusion
		// [---p---]  or
		// [--n--]
		else if (next.start === prev.start && next.end < prev.end) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = next;
				joined.push({ ...prev, start: next.start });
			}
		}
		// same end inclusion
		// [---p---]
		// 	[--n--]
		else if (prev.end === next.end && prev.start < next.start) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
			}
		}
		// complete inclusion
		// [---p---]
		// [--n--]
		else if (prev.start < next.start && next.end < prev.end) {
			if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
				joined.push({ ...prev, start: next.end });
			}
		}
		// intersecting or adjacent
		// [---p---]      or [---p---]
		//     [---n---]              [---n---]
		else if (next.start > prev.start && next.end > prev.end) {
			if (next.type === prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.end };
			} else if (next.type < prev.type) {
				joined[joined.length - 1] = { ...prev, end: next.start };
				joined.push(next);
			} else if (next.type > prev.type) {
				joined.push({ ...next, start: prev.end });
			}
		}
		// same start
		// [--p--]
		// [---n---]
		else if (prev.start === next.start && prev.end < next.end) {
			if (next.type <= prev.type) {
				joined[joined.length - 1] = next;
			} else {
				joined.push({ ...next, start: prev.end });
			}
		} else {
			joined.push(next);
		}
		return joined;
	}, []);

/**
 * split an array of matches into nests where each nest is distinct and nested items are all overlapped
 * @param matches the matches to split
 */
export const findNests = (matches: Match[]): Match[][] => {
	if (matches.length === 0) {
		return [[]];
	}
	matches.sort((a, b) => a.start - b.start || a.end - b.end || a.type - b.type);
	const nests: Match[][] = [[matches[0]]];
	let nestFurthestEnd = matches[0].end;
	for (const interval of matches) {
		if (interval.start > nestFurthestEnd) {
			nests.push([interval]);
			nestFurthestEnd = interval.end;
		} else {
			nests[nests.length - 1].push(interval);
			nestFurthestEnd = Math.max(nestFurthestEnd, interval.end);
		}
	}
	return nests;
};

/**
 * merge overlapping matches in a list of matches
 * @param matches the list of matches
 */
export const mergeWords = (matches: Match[]): Match[] => {
	return findNests(matches).reduce((all, nest) => all.concat(mergeWordIntervals(nest)), []);
};

/**
 * calculate statistics using the scan's `completeResult` and a list of `results`
 * @param completeResult the report's complete result
 * @param results the results to calculate statistics from
 */
export const calculateStatistics = (
	completeResult: ICompleteResults,
	results: ResultDetailItem[],
	options?: ICopyleaksReportOptions
): ReportStatistics => {
	const { totalWords, totalExcluded } = completeResult.scannedDocument;
	const identical = options?.showIdentical ? results.flatMap(createWordIntervalsFrom('identical', 'source')) : [];
	const minorChanges = options?.showMinorChanges
		? results.flatMap(createWordIntervalsFrom('minorChanges', 'source'))
		: [];
	const relatedMeaning = options?.showRelated
		? results.flatMap(createWordIntervalsFrom('relatedMeaning', 'source'))
		: [];
	const withOutoverlaps = mergeWords([...relatedMeaning, ...minorChanges, ...identical]);
	const identicalCount = withOutoverlaps
		.filter(match => match.type === MatchType.identical)
		.reduce((total, elem) => total + (elem.end - elem.start), 0);
	const minorChangesCount = withOutoverlaps
		.filter(match => match.type === MatchType.minorChanges)
		.reduce((total, elem) => total + (elem.end - elem.start), 0);
	const relatedMeaningCount = withOutoverlaps
		.filter(match => match.type === MatchType.relatedMeaning)
		.reduce((total, elem) => total + (elem.end - elem.start), 0);

	let aggregatedScore = Math.min(
		1,
		(identicalCount + relatedMeaningCount + minorChangesCount) / (totalWords - totalExcluded)
	);
	aggregatedScore = isNaN(aggregatedScore) ? 0 : aggregatedScore;

	const aiStatistics = getAiStatistics(completeResult);

	return {
		aggregatedScore,
		identical: identicalCount,
		relatedMeaning: relatedMeaningCount,
		minorChanges: minorChangesCount,
		omittedWords: totalExcluded,
		total: totalWords,
		aiScore: aiStatistics?.ai ?? 0,
		humanScore: aiStatistics?.human ?? 0,
	};
};

export const getAiStatistics = (completeResult: ICompleteResults): AIScanResultSummary | null => {
	const aiAlert = completeResult.notifications?.alerts?.find(a => a.code === ALERTS.SUSPECTED_AI_TEXT_DETECTED);
	if (aiAlert) {
		const aiData: AIScanResult = JSON.parse(aiAlert.additionalData);
		return aiData.summary;
	}
	return null;
};

export const getWritingFeedbackStatistics = (
	score: IWritingFeedbackScore,
	filteredCorrections?: IWritingFeedbackScanScource,
	totalWords?: number
): WritingFeedbackScanResultSummary | null => {
	if (!score?.corrections || !filteredCorrections)
		return {
			overallScore: null,
			overallTotalIssues: null,
		};
	const scoreCopy: IWritingFeedbackScore = JSON.parse(JSON.stringify(score));
	scoreCopy.corrections = {
		...scoreCopy.corrections,
		grammarCorrectionsScore: calculateScore(
			totalWords,
			filteredCorrections?.text?.chars?.types?.filter(
				type => getSelectedCategoryType(type) === EWritingFeedbackTypes.Grammar
			)?.length ?? 0
		),
		sentenceStructureCorrectionsScore: calculateScore(
			totalWords,
			filteredCorrections?.text?.chars?.types?.filter(
				type => getSelectedCategoryType(type) === EWritingFeedbackTypes.SentenceStructure
			)?.length ?? 0
		),
		mechanicsCorrectionsScore: calculateScore(
			totalWords,
			filteredCorrections?.text?.chars?.types?.filter(
				type => getSelectedCategoryType(type) === EWritingFeedbackTypes.Mechanics
			)?.length ?? 0
		),
		wordChoiceCorrectionsScore: calculateScore(
			totalWords,
			filteredCorrections?.text?.chars?.types?.filter(
				type => getSelectedCategoryType(type) === EWritingFeedbackTypes.WordChoice
			)?.length ?? 0
		),
	};

	return {
		overallScore: (calculateOverallCorrectionsScore(scoreCopy.corrections) ?? 0) / 100,
		overallTotalIssues: filteredCorrections?.text?.chars?.operationTexts?.length,
	};
};

export const calculateOverallCorrectionsScore = (correctionsScore: IWritingFeedbackCorrections): number => {
	if (!correctionsScore) return 0;
	const weightSum =
		correctionsScore.grammarScoreWeight +
		correctionsScore.mechanicsScoreWeight +
		correctionsScore.sentenceStructureScoreWeight +
		correctionsScore.wordChoiceScoreWeight;

	if (weightSum > 0) {
		const overallCorrectionsScore =
			Math.round(
				((correctionsScore.grammarCorrectionsScore * correctionsScore.grammarScoreWeight +
					correctionsScore.mechanicsCorrectionsScore * correctionsScore.mechanicsScoreWeight +
					correctionsScore.sentenceStructureCorrectionsScore * correctionsScore.sentenceStructureScoreWeight +
					correctionsScore.wordChoiceCorrectionsScore * correctionsScore.wordChoiceScoreWeight) /
					weightSum) *
					Math.pow(10, 0)
			) / Math.pow(10, 0);
		return overallCorrectionsScore;
	}
	return 0; // or handle the case where weightSum <= 0 differently if needed
};

export const calculateScore = (numTokens: number, categoryCorrectedTokens: number): number => {
	if (!numTokens) return 0;
	const score = ((numTokens - categoryCorrectedTokens) / numTokens) ** 4 * 100;
	return score;
};

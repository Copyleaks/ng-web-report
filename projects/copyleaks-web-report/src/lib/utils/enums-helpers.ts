import {
	EResultPreviewType,
	EWritingFeedbackCategories,
	EWritingFeedbackTypes,
} from '../enums/copyleaks-web-report.enums';
import { IWritingFeedbackTypeStatistics, IWritingFeedbackCategoryStatistics } from '../models/report-statistics.models';

export function getResultsTypeTitle(type: EResultPreviewType): string {
	switch (type) {
		case EResultPreviewType.Batch:
			return $localize`This batch`;
		case EResultPreviewType.Internet:
			return $localize`Internet`;
		case EResultPreviewType.Repositroy:
			return $localize`Repository`;
		case EResultPreviewType.Database:
			return $localize`Copyleaks internal database`;
		default:
			return $localize`Unknown Type`;
	}
}

export function getCorrectionTypeTitle(type: EWritingFeedbackTypes): string {
	switch (type) {
		case EWritingFeedbackTypes.General:
			return $localize`General`;
		case EWritingFeedbackTypes.Grammar:
			return $localize`Grammar`;
		case EWritingFeedbackTypes.Mechanics:
			return $localize`Mechanics`;
		case EWritingFeedbackTypes.WordChoice:
			return $localize`Word Choice`;
		case EWritingFeedbackTypes.SentenceStructure:
			return $localize`Sentence Structure`;
		case EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles:
			return $localize`Incorrect Number Agreement Between Articles`;
		case EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns:
			return $localize`Incorrect Number Agreement Between Nouns`;
		case EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives:
			return $localize`Mismatch In Gender Between Adjectives`;
		default:
			return $localize`Unknown Type`;
	}
}

export function getCorrectionCategoryTitle(type: EWritingFeedbackCategories): string {
	switch (type) {
		case EWritingFeedbackCategories.General:
			return $localize`General`;
		case EWritingFeedbackCategories.SubjectVerbDisagreement:
			return $localize`Subject Verb Disagreement`;
		case EWritingFeedbackCategories.NounForm:
			return $localize`Noun Form`;
		case EWritingFeedbackCategories.VerbForm:
			return $localize`Verb Form`;
		case EWritingFeedbackCategories.Article:
			return $localize`Article`;
		case EWritingFeedbackCategories.Preposition:
			return $localize`Preposition`;
		case EWritingFeedbackCategories.Pronoun:
			return $localize`Pronoun`;
		case EWritingFeedbackCategories.PartOfSpeech:
			return $localize`Part of Speech`;
		case EWritingFeedbackCategories.Conjunction:
			return $localize`Conjunction`;
		case EWritingFeedbackCategories.CommaSplice:
			return $localize`Comma Splice`;
		case EWritingFeedbackCategories.FusedSentence:
			return $localize`Fused Sentence`;
		case EWritingFeedbackCategories.MissingWords:
			return $localize`Missing Words`;
		case EWritingFeedbackCategories.ExtraWords:
			return $localize`Extra Words`;
		case EWritingFeedbackCategories.IneffectiveConstruction:
			return $localize`Ineffective Construction`;
		case EWritingFeedbackCategories.MisusedWord:
			return $localize`Misused Word`;
		case EWritingFeedbackCategories.Homophone:
			return $localize`Homophone`;
		case EWritingFeedbackCategories.Spelling:
			return $localize`Spelling`;
		case EWritingFeedbackCategories.Comma:
			return $localize`Comma`;
		case EWritingFeedbackCategories.Apostrophe:
			return $localize`Apostrophe`;
		case EWritingFeedbackCategories.Capitalization:
			return $localize`Capitalization`;
		case EWritingFeedbackCategories.Hyphen:
			return $localize`Hyphen`;
		case EWritingFeedbackCategories.Punctuation:
			return $localize`Punctuation`;
		case EWritingFeedbackCategories.Space:
			return $localize`Space`;
		case EWritingFeedbackCategories.SentenceFragments:
			return $localize`Sentence Fragments`;
		case EWritingFeedbackCategories.AdjectiveGenderAgreement:
			return $localize`Adjective Gender Agreement`;
		case EWritingFeedbackCategories.AdjectiveNumberAgreement:
			return $localize`Adjective Number Agreement`;
		case EWritingFeedbackCategories.ArticleGenderAgreement:
			return $localize`Article Gender Agreement`;
		case EWritingFeedbackCategories.ArticleNumberAgreement:
			return $localize`Article Number Agreement`;
		case EWritingFeedbackCategories.NounGenderAgreement:
			return $localize`Noun Gender Agreement`;
		case EWritingFeedbackCategories.SubjunctiveMood:
			return $localize`Subjunctive Mood`;
		case EWritingFeedbackCategories.CompoundWordError:
			return $localize`Compound Word Error`;
		case EWritingFeedbackCategories.MoodInconsistency:
			return $localize`Mood Inconsistency`;
		case EWritingFeedbackCategories.AccentError:
			return $localize`Accent Error`;
		case EWritingFeedbackCategories.HomoglyphError:
			return $localize`Homoglyph Error`;
		default:
			return $localize`Unknown Type`;
	}
}

export function getCorrectionCategoryDescription(type: EWritingFeedbackCategories): string {
	switch (type) {
		case EWritingFeedbackCategories.General:
			return $localize`A general correction detected.`;
		case EWritingFeedbackCategories.SubjectVerbDisagreement:
			return $localize`The subject and verb do not agree in number.`;
		case EWritingFeedbackCategories.NounForm:
			return $localize`Using an incorrect form of a noun (such as pluralization or possessive form) in a sentence.`;
		case EWritingFeedbackCategories.VerbForm:
			return $localize`Using an incorrect form of a verb (such as tense, aspect, or agreement) in a sentence results.`;
		case EWritingFeedbackCategories.Article:
			return $localize`Using the wrong article (a, an, or the) or omitting an article inappropriately in a sentence results.`;
		case EWritingFeedbackCategories.Preposition:
			return $localize`Using the wrong preposition or misplacing a preposition in a sentence.`;
		case EWritingFeedbackCategories.Pronoun:
			return $localize`Using an incorrect pronoun or misplacing a pronoun in a sentence.`;
		case EWritingFeedbackCategories.PartOfSpeech:
			return $localize`Misusing or misidentifying a word's grammatical category, such as confusing a noun with a verb.`;
		case EWritingFeedbackCategories.Conjunction:
			return $localize`Misusing or misplacing conjunctions, which are words that connect words, phrases, or clauses in a sentence.`;
		case EWritingFeedbackCategories.CommaSplice:
			return $localize`Two independent clauses are incorrectly joined by a comma without a coordinating conjunction or appropriate punctuation.`;
		case EWritingFeedbackCategories.FusedSentence:
			return $localize`When two independent clauses are incorrectly joined without appropriate punctuation or conjunction.`;
		case EWritingFeedbackCategories.MissingWords:
			return $localize`Identifies sentences that are missing essential words, resulting in incomplete or unclear meaning.`;
		case EWritingFeedbackCategories.ExtraWords:
			return $localize`Sentences that contain unnecessary or redundant words, which can be removed for clearer and more concise writing.`;
		// Note: "ExtraWords" and "MissingWords" repeated, using the first occurrence for simplicity.
		case EWritingFeedbackCategories.IneffectiveConstruction:
			return $localize`Refers to sentences or phrases that are poorly constructed or lack clarity, making it difficult for readers to understand the intended meaning.`;
		case EWritingFeedbackCategories.MisusedWord:
			return $localize`Words that are used incorrectly or inappropriately in a given context.`;
		case EWritingFeedbackCategories.Homophone:
			return $localize`Confusing two words that phonetically sound similar but have a different meaning (e.g., 'their' and 'there' or 'to' and 'too').`;
		case EWritingFeedbackCategories.Spelling:
			return $localize`Misspelling of a word.`;
		case EWritingFeedbackCategories.Comma:
			return $localize`Incorrect use of commas in sentences.`;
		case EWritingFeedbackCategories.Apostrophe:
			return $localize`Incorrect use of apostrophes in sentences.`;
		case EWritingFeedbackCategories.Capitalization:
			return $localize`Word was not capitalized correctly (e.g., 'paris' should be 'Paris').`;
		case EWritingFeedbackCategories.Hyphen:
			return $localize`Incorrect or inconsistent use of hyphens in a sentence.`;
		case EWritingFeedbackCategories.Punctuation:
			return $localize`Incorrect use of punctuation marks, such as commas, periods, semicolons, or colons`;
		case EWritingFeedbackCategories.Space:
			return $localize`Missing or extra spaces detected in sentence.`;
		case EWritingFeedbackCategories.SentenceFragments:
			return $localize`When a group of words appears to be a sentence but is incomplete because it lacks a subject, a predicate, or both.`;
		case EWritingFeedbackCategories.AdjectiveGenderAgreement:
			return $localize`Detects errors in the gender agreement between adjectives and nouns.`;
		case EWritingFeedbackCategories.AdjectiveNumberAgreement:
			return $localize`Highlights discrepancies in the number agreement between adjectives and nouns for improved grammatical precision.`;
		case EWritingFeedbackCategories.ArticleGenderAgreement:
			return $localize`Agreement between articles and nouns in terms of gender is incorrect, ensuring grammatical accuracy.`;
		case EWritingFeedbackCategories.ArticleNumberAgreement:
			return $localize`Number mismatch between articles and nouns creating inconsistency in how they refer to the same or similar elements in a sentence.`;
		case EWritingFeedbackCategories.NounGenderAgreement:
			return $localize`Lack of agreement between nouns and their associated genders, ensuring grammatical harmony.`;
		case EWritingFeedbackCategories.SubjunctiveMood:
			return $localize`Identifies the incorrect usage of the subjunctive mood in sentences, ensuring proper expression of hypothetical or unreal situations.`;
		case EWritingFeedbackCategories.CompoundWordError:
			return $localize`Identifies incorrect compound word usage.`;
		case EWritingFeedbackCategories.MoodInconsistency:
			return $localize`Detects inconsistencies in the expression of mood within a sentence, ensuring cohesive writing.`;
		case EWritingFeedbackCategories.AccentError:
			return $localize`Highlights deviations in accents, promoting uniform language usage.`;
		case EWritingFeedbackCategories.HomoglyphError:
			return $localize`Non-standard characters that resemble standard ones have been detected.`;
		default:
			return $localize`Unknown feedback type.`;
	}
}

export function getSelectedCategoryType(type: EWritingFeedbackCategories): EWritingFeedbackTypes {
	switch (type) {
		case EWritingFeedbackCategories.General:
			return EWritingFeedbackTypes.General;

		case EWritingFeedbackCategories.SubjectVerbDisagreement:
		case EWritingFeedbackCategories.NounForm:
		case EWritingFeedbackCategories.VerbForm:
		case EWritingFeedbackCategories.Article:
		case EWritingFeedbackCategories.Preposition:
		case EWritingFeedbackCategories.Pronoun:
		case EWritingFeedbackCategories.PartOfSpeech:
		case EWritingFeedbackCategories.Conjunction:
		case EWritingFeedbackCategories.HomoglyphError:
			return EWritingFeedbackTypes.Grammar;

		case EWritingFeedbackCategories.MisusedWord:
		case EWritingFeedbackCategories.Homophone:
			return EWritingFeedbackTypes.WordChoice;

		case EWritingFeedbackCategories.Capitalization:
		case EWritingFeedbackCategories.Hyphen:
		case EWritingFeedbackCategories.Punctuation:
		case EWritingFeedbackCategories.Comma:
		case EWritingFeedbackCategories.Apostrophe:
		case EWritingFeedbackCategories.Space:
		case EWritingFeedbackCategories.Spelling:
			return EWritingFeedbackTypes.Mechanics;

		case EWritingFeedbackCategories.FusedSentence:
		case EWritingFeedbackCategories.CommaSplice:
		case EWritingFeedbackCategories.SentenceFragments:
		case EWritingFeedbackCategories.IneffectiveConstruction:
		case EWritingFeedbackCategories.ExtraWords:
		case EWritingFeedbackCategories.MissingWords:
			return EWritingFeedbackTypes.SentenceStructure;

		case EWritingFeedbackCategories.AdjectiveGenderAgreement:
		case EWritingFeedbackCategories.AdjectiveNumberAgreement:
			return EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives;

		case EWritingFeedbackCategories.ArticleGenderAgreement:
		case EWritingFeedbackCategories.ArticleNumberAgreement:
			return EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles;

		case EWritingFeedbackCategories.NounGenderAgreement:
		case EWritingFeedbackCategories.SubjunctiveMood:
		case EWritingFeedbackCategories.CompoundWordError:
		case EWritingFeedbackCategories.MoodInconsistency:
		case EWritingFeedbackCategories.AccentError:
			return EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns;
		default:
			break;
	}
}
export function getSelectedCategoryStats(
	type: EWritingFeedbackCategories,
	writingFeedbackStats: IWritingFeedbackTypeStatistics[]
): IWritingFeedbackCategoryStatistics {
	switch (type) {
		case EWritingFeedbackCategories.General:
			return writingFeedbackStats[EWritingFeedbackTypes.General].categories[0];

		case EWritingFeedbackCategories.SubjectVerbDisagreement:
		case EWritingFeedbackCategories.NounForm:
		case EWritingFeedbackCategories.VerbForm:
		case EWritingFeedbackCategories.Article:
		case EWritingFeedbackCategories.Preposition:
		case EWritingFeedbackCategories.Pronoun:
		case EWritingFeedbackCategories.PartOfSpeech:
		case EWritingFeedbackCategories.Conjunction:
			return writingFeedbackStats[EWritingFeedbackTypes.Grammar].categories[
				type - EWritingFeedbackCategories.SubjectVerbDisagreement
			];

		case EWritingFeedbackCategories.MisusedWord:
		case EWritingFeedbackCategories.Homophone:
			return writingFeedbackStats[EWritingFeedbackTypes.WordChoice].categories[
				type - EWritingFeedbackCategories.MisusedWord
			];

		case EWritingFeedbackCategories.Capitalization:
		case EWritingFeedbackCategories.Hyphen:
		case EWritingFeedbackCategories.Punctuation:
		case EWritingFeedbackCategories.Comma:
		case EWritingFeedbackCategories.Apostrophe:
		case EWritingFeedbackCategories.Space:
		case EWritingFeedbackCategories.Spelling:
			return writingFeedbackStats[EWritingFeedbackTypes.Mechanics].categories[
				type - EWritingFeedbackCategories.Capitalization
			];

		case EWritingFeedbackCategories.FusedSentence:
		case EWritingFeedbackCategories.CommaSplice:
		case EWritingFeedbackCategories.SentenceFragments:
		case EWritingFeedbackCategories.IneffectiveConstruction:
		case EWritingFeedbackCategories.ExtraWords:
		case EWritingFeedbackCategories.MissingWords:
			return writingFeedbackStats[EWritingFeedbackTypes.SentenceStructure].categories[
				type - EWritingFeedbackCategories.FusedSentence
			];

		case EWritingFeedbackCategories.AdjectiveGenderAgreement:
		case EWritingFeedbackCategories.AdjectiveNumberAgreement:
			return writingFeedbackStats[EWritingFeedbackTypes.MismatchInGenderBetweenAdjectives].categories[
				type - EWritingFeedbackCategories.AdjectiveGenderAgreement
			];

		case EWritingFeedbackCategories.ArticleGenderAgreement:
		case EWritingFeedbackCategories.ArticleNumberAgreement:
			return writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenArticles].categories[
				type - EWritingFeedbackCategories.ArticleGenderAgreement
			];

		case EWritingFeedbackCategories.NounGenderAgreement:
		case EWritingFeedbackCategories.SubjunctiveMood:
		case EWritingFeedbackCategories.CompoundWordError:
		case EWritingFeedbackCategories.MoodInconsistency:
		case EWritingFeedbackCategories.AccentError:
			return writingFeedbackStats[EWritingFeedbackTypes.IncorrectNumberAgreementBetweenNouns].categories[
				type - EWritingFeedbackCategories.NounGenderAgreement
			];

		case EWritingFeedbackCategories.HomoglyphError:
			return writingFeedbackStats[EWritingFeedbackTypes.Grammar].categories[8];

		default:
			return null;
	}
}

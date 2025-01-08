/**
 * File: report-scan-errors.constants.ts
 *
 * Description:
 * This file defines a constant object, `ERROR_MESSAGES`, which maps error codes
 * to their corresponding localized error messages. It is used to provide consistent
 * and maintainable error handling for the report scanning feature.
 *
 * Each error code corresponds to a predefined error message, localized using Angular's
 * `$localize` for internationalization support.
 *
 * Usage:
 * Import the `ERROR_MESSAGES` constant wherever error messages need to be retrieved
 * based on error codes.
 *
 * Example:
 * ```typescript
 * import { ERROR_MESSAGES } from './report-scan-errors.constants';
 *
 * const errorCode = 2;
 * console.log(ERROR_MESSAGES[errorCode]); // Output: Invalid login credentials.
 * ```
 *
 * Key Considerations:
 * - Always use `$localize` to ensure proper internationalization of error messages.
 * - Handle unknown error codes by checking for `undefined` values.
 * - This file should be updated whenever new error codes or messages are introduced.
 *
 * Structure:
 * { [key: number]: string }
 * - Key: The error code (numeric).
 * - Value: The localized error message (string).
 */
export const ERROR_MESSAGES: { [key: number]: string } = {
	1: $localize`Bad request. One or several required parameters are missing or incorrect.`,
	2: $localize`Invalid login credentials.`,
	3: $localize`To use your account, you need to confirm the email address.`,
	4: $localize`This user is disabled. Contact support for help.`,
	5: $localize`Failed to download the requested URL.`,
	6: $localize`Cannot complete the scan request because the file is too large. For more information: http://bit.ly/2fqJOqP`,
	7: $localize`Failed reading the submitted text.`,
	8: $localize`The image quality is too low to scan.`,
	9: $localize`Temporarily unavailable. Please try again later.`,
	10: $localize`This file type is not supported. Read more - link`,
	11: $localize`Not enough text to scan. The minimum text length is 30 characters and at least 6 words.`,
	13: $localize`You don't have enough credits to complete the request!`,
	14: $localize`The submitted file is invalid.`,
	15: $localize`The submitted URL is invalid!`,
	17: $localize`You have no credits. You need to purchase credits in order to complete the request.`,
	18: $localize`Copyshield widget is not showing on your webpage.`,
	20: $localize`Only MIME multipart content type is allowed!`,
	21: $localize`You can upload one file at a time!`,
	22: $localize`Unable to determine file size.`,
	24: $localize`Bad filename!`,
	25: $localize`Undefined language!`,
	26: $localize`The request cannot be completed because the process is still running.`,
	27: $localize`Unknown process id!`,
	37: $localize`Authorization has been denied for this request.`,
};

import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, concatMap } from 'rxjs/operators';

export function retryWithDelay(retryIntervals: number[] = [30000, 60000, 90000]) {
	return <T>(source: Observable<T>) =>
		source.pipe(
			retryWhen(errors =>
				errors.pipe(
					concatMap((error, index) => {
						if (index < retryIntervals.length) {
							return timer(retryIntervals[index]);
						} else {
							return throwError(error);
						}
					})
				)
			)
		);
}

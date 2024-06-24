import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, concatMap } from 'rxjs/operators';

export function retryWithDelay(retryIntervals: number[] = [10000, 15000, 20000]) {
	return <T>(source: Observable<T>) =>
		source.pipe(
			retryWhen(errors =>
				errors.pipe(
					concatMap((error, index) => {
						if (error?.status && error?.status > 500 && index < retryIntervals.length) {
							return timer(retryIntervals[index]);
						} else {
							return throwError(error);
						}
					})
				)
			)
		);
}

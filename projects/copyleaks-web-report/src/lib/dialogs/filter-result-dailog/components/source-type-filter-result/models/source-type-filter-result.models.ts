export interface ITotalSourceType {
	totalInternet: number;
	totalInternalDatabase: number;
	totalbatch: number;
	repository?: ISourceRepositoryType[];
}

export interface ISourceRepositoryType {
	id: string;
	title: string;
}

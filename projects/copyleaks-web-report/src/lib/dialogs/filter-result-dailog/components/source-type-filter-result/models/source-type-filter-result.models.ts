export interface ITotalSourceType {
	totalInternet: number;
	totalInternalDatabase: number;
	totalYourFiles: number;
	totalOthersFiles: number;
	totalbatch: number;
	repository?: ISourceRepositoryType[];
}

export interface ISourceRepositoryType {
	id: string;
	title: string;
}

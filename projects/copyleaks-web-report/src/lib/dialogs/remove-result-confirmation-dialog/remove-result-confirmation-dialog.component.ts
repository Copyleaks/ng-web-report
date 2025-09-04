import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRemoveResultConfirmationDialogData } from './models/remove-result-confirmation-dialog.models';

@Component({
	selector: 'cr-remove-result-confirmation-dialog',
	templateUrl: './remove-result-confirmation-dialog.component.html',
	styleUrls: ['./remove-result-confirmation-dialog.component.scss'],
	standalone: false,
})
export class RemoveResultConfirmationDialogComponent implements OnInit {
	deleting: boolean = false;

	constructor(
		private _dialogRef: MatDialogRef<RemoveResultConfirmationDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IRemoveResultConfirmationDialogData
	) {}

	ngOnInit(): void {}

	onCancel() {
		this._dialogRef.close();
	}

	async onConfirmAsync() {
		try {
			// show loading view & don't allow for outside clicks
			this.deleting = true;
			this._dialogRef.disableClose = true;

			// send the delete request and close dialog if sucess
			await this.data.reportDataSvc.deleteResultById(this.data.resultInfo);
			this._dialogRef.close();
		} catch (error) {
		} finally {
			this._dialogRef.disableClose = false;
			this.deleting = false;
		}
	}
}

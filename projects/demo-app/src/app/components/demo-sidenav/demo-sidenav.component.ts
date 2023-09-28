import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
	selector: 'app-demo-sidenav',
	templateUrl: './demo-sidenav.component.html',
	styleUrls: ['./demo-sidenav.component.scss'],
})
export class DemoSidenavComponent {
	@ViewChild('sidenav') sidenav: MatSidenav;
	showFiller = true;

	constructor(private _router: Router) {}

	navigateToComponents() {
		this._router.navigate(['/components']);
	}

	navigateToLayouts() {
		this._router.navigate(['/layouts']);
	}

	navigateToBundleReport() {
		this._router.navigate(['/v2/web-report/bundle/default']);
	}
}

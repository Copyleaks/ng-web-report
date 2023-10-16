import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-demo-sidenav',
	templateUrl: './demo-sidenav.component.html',
	styleUrls: ['./demo-sidenav.component.scss'],
})
export class DemoSidenavComponent implements OnInit {
	@ViewChild('sidenav') sidenav: MatSidenav;
	showFiller = true;
	paramSub: any;
	reportId: string | null;

	constructor(private _router: Router, private _route: ActivatedRoute) {}

	ngOnInit(): void {
		this.paramSub = this._route.paramMap.subscribe(params => {
			this.reportId = params.get('id');
		});
	}

	ngOnDestroy(): void {
		this.paramSub.unsubscribe();
	}

	navigateToComponents() {
		this._router.navigate(['/components']);
	}

	navigateToLayouts() {
		this._router.navigate(['/layouts']);
	}

	navigateToBundleReport() {
		this._router.navigate(['/v2/web-report/bundle/default']);
	}

	navigateToReportPreview(option: string | null = null, alertCode: string | null = null) {
		this._router
			.navigate([`/previews/${option ?? 'default'}`], {
				queryParams: {
					alertCode: alertCode,
					contentMode: alertCode ? 'text' : 'html',
				},
			})
			.then(() => {
				window.location.reload();
			});
	}

	openMenu(trigger: MatMenuTrigger) {
		trigger.openMenu();
	}

	closeMenu(trigger: MatMenuTrigger) {
		trigger.closeMenu();
	}
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyleaksPlagiarismReportComponent } from './copyleaks-plagiarism-report.component';

describe('CopyleaksPlagiarismReportLibV2Component', () => {
	let component: CopyleaksPlagiarismReportComponent;
	let fixture: ComponentFixture<CopyleaksPlagiarismReportComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CopyleaksPlagiarismReportComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CopyleaksPlagiarismReportComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

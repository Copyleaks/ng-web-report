import { TestBed } from '@angular/core/testing';

import { CopyleaksWebReportService } from './copyleaks-web-report.service';

describe('CopyleaksWebReportService', () => {
  let service: CopyleaksWebReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopyleaksWebReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

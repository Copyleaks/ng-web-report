import { TestBed } from '@angular/core/testing';

import { CopyleaksPlagiarismReportLibV2Service } from './copyleaks-plagiarism-report.service';

describe('CopyleaksPlagiarismReportLibV2Service', () => {
  let service: CopyleaksPlagiarismReportLibV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopyleaksPlagiarismReportLibV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

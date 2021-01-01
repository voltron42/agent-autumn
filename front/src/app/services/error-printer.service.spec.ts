import { TestBed } from '@angular/core/testing';

import { ErrorPrinterService } from './error-printer.service';

describe('ErrorPrinterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ErrorPrinterService = TestBed.get(ErrorPrinterService);
    expect(service).toBeTruthy();
  });
});

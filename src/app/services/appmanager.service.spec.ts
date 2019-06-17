import { TestBed } from '@angular/core/testing';

import { AppmanagerService } from './appmanager.service';

describe('AppmanagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppmanagerService = TestBed.get(AppmanagerService);
    expect(service).toBeTruthy();
  });
});

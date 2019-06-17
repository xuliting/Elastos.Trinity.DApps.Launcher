import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningManagerComponent } from './running-manager.component';

describe('RunningManagerComponent', () => {
  let component: RunningManagerComponent;
  let fixture: ComponentFixture<RunningManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningManagerComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

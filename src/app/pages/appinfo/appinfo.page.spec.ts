import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppinfoPage } from './appinfo.page';

describe('AppinfoPage', () => {
  let component: AppinfoPage;
  let fixture: ComponentFixture<AppinfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppinfoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

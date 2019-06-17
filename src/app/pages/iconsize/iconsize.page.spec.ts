import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconsizePage } from './iconsize.page';

describe('IconsizePage', () => {
  let component: IconsizePage;
  let fixture: ComponentFixture<IconsizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconsizePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconsizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

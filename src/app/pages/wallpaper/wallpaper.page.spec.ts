import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallpaperPage } from './wallpaper.page';

describe('WallpaperPage', () => {
  let component: WallpaperPage;
  let fixture: ComponentFixture<WallpaperPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallpaperPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallpaperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

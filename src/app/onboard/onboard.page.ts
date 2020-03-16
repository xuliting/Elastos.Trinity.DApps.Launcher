import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
})
export class OnboardPage implements OnInit {

  constructor(
    public theme: ThemeService,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    appManager.setVisible("show", () => {}, (err) => {});
  }

  // slider
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    centeredSlides: true,
    slidesPerView: 1
  };

  next(slide) {
    slide.slideNext();
  }

  prev(slide) {
    slide.slidePrev();
  }

  exit() {
    this.storage.setVisit(true);
    this.router.navigate(['desktop']);
  }
}

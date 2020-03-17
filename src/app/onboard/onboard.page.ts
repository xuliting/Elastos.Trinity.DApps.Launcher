import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { IonSlides, Platform } from '@ionic/angular';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
})
export class OnboardPage implements OnInit {

  @ViewChild(IonSlides) private slides: IonSlides;

  hidden = true

  // Slider options
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    centeredSlides: true,
    slidesPerView: 1,
    init:false
  };

  constructor(
    public theme: ThemeService,
    private storage: StorageService,
    private router: Router,
    private platform: Platform
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    appManager.setVisible("show");
  }

  ionViewDidEnter() {
    // Dirty hack because on iOS we are currently unable to understand why the 
    // ion-slides width is sometimes wrong when an app starts. Waiting a few 
    // seconds (DOM fully rendered once...?) seems to solve this problem.
    if (this.platform.platforms().indexOf('ios') >= 0) {
      setTimeout(()=>{
        this.showSlider();
      }, 3000)
    }
    else {
      this.showSlider();
    }
  }

  showSlider() {
    this.hidden = false
    this.slides.getSwiper().then((swiper)=>{
      swiper.init();
    })
  }

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

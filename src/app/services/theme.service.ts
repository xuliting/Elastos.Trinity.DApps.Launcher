import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public darkMode = false;

  constructor(private platform: Platform, private storage: StorageService) {
    this.platform.ready().then(() => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      prefersDark.addListener(event => {
        console.log(event);
        this.setTheme(event.matches);
      });

      this.getTheme();
    });
  }

  getTheme() {
    this.storage.getTheme().then((res) => {
      if (res) {
        this.darkMode = res;
        this.setTheme(this.darkMode);
      }
    });
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.setTheme(this.darkMode);
    this.storage.setTheme(this.darkMode);
  }

  setTheme(dark) {
    this.darkMode = dark;
    if (this.darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }
}

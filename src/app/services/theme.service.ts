import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AppmanagerService } from './appmanager.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public darkMode = false;

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.getTheme();
    });
  }

  getTheme() {
    appManager.getPreference("ui.darkmode", (value) => {
      this.darkMode = value;
      this.setTheme(this.darkMode);
    });
  }

  setTheme(dark) {
    this.darkMode = dark;
    if (this.darkMode) {
      // Set dark mode globally
      document.body.classList.add("dark");

      // Set dark mode to native header
      titleBarManager.setBackgroundColor("#495788");
      titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);

    } else {
      // Remove dark mode globally
      document.body.classList.remove("dark");

      // Remove dark mode to native header
      titleBarManager.setBackgroundColor("#7a81f1");
      titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
    }
  }
}

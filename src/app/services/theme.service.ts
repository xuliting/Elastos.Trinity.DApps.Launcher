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
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      prefersDark.addListener(event => {
        console.log(event);
        this.setTheme(event.matches);
      });

      this.getTheme();
    });
  }

  getTheme() {
    appManager.getPreference("ui.darkmode", (value)=>{
      this.darkMode = value;
      console.log("this.darkMode",this.darkMode) // BUGGY!! We set a string, we get a boolean....! Appmanager bug
      this.setTheme(this.darkMode);
    });
  }

  setTheme(dark) {
    this.darkMode = dark;
    if (this.darkMode) {
      // Set dark mode globally
      document.body.classList.add("dark");

      // Set dark mode to native header
      titleBarManager.setBackgroundColor("#121212");
      TitleBarPlugin.TitleBarForegroundMode.LIGHT;

    } else {
      // Remove dark mode globally
      document.body.classList.remove("dark");

      // Remove dark mode to native header
      titleBarManager.setBackgroundColor("#ffffff");
      TitleBarPlugin.TitleBarForegroundMode.DARK;
    }
  }
}

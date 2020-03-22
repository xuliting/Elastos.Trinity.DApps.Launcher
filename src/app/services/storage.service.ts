import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
  }

  /*** Favorites ***/
  public setFavApps(value: any) {
    return this.storage.set("favs", JSON.stringify(value)).then((data) => {
      console.log('Stored Favorite Apps', data);
    });
  }

  public getFavApps(): Promise<any> {
    return this.storage.get("favs").then((data) => {
      console.log(data);
      return JSON.parse(data);
    });
  }

  /*** Browsing History ***/
  public setBrowsedApps(value: any) {
    return this.storage.set("history", JSON.stringify(value)).then((data) => {
      console.log('Stored Browsed Apps');
    });
  }

  public getBrowsedApps(): Promise<any> {
    return this.storage.get("history").then((data) => {
      console.log(data);
      return JSON.parse(data);
    });
  }

  /*** Dark Mode ***/
  public setTheme(value: boolean) {
    return this.storage.set("theme", JSON.stringify(value)).then((data) => {
      console.log('Saved theme', data);
    });
  }

  public getTheme(): Promise<boolean> {
    return this.storage.get("theme").then((data) => {
      console.log('Fetched theme', data);
      return JSON.parse(data);
    });
  }

  /*** First Visit? ***/
  public setVisit(value: boolean) {
    return this.storage.set("visited", JSON.stringify(value)).then((data) => {
      console.log('Set first visit', data);
    });
  }

  public getVisit(): Promise<boolean> {
    return this.storage.get("visited").then((data) => {
      console.log('Already visited', data);
      return JSON.parse(data);
    });
  }
}

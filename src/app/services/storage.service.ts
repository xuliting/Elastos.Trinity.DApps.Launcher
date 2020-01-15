import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
  }

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

  public setBrowsedApps(value: any) {
    return this.storage.set("history", JSON.stringify(value)).then((data) => {
      console.log('Stored Browsed Apps', data);
    });
  }

  public getBrowsedApps(): Promise<any> {
    return this.storage.get("history").then((data) => {
      console.log(data);
      return JSON.parse(data);
    });
  }
}

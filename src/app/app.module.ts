import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { DragulaModule } from 'ng2-dragula';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { zh } from './../assets/i18n/zh';
import { en } from './../assets/i18n/en';

import { SafePipe } from './pipes/safe.pipe';
import { SplashscreenPage } from './splash/splashscreen/splashscreen.page';
import { SplashscreenPageModule } from './splash/splashscreen/splashscreen.module';
import { RunningManagerComponent } from './components/running-manager/running-manager.component';

export class CustomTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create(observer => {
            switch (lang) {
                case 'zh':
                default:
                    observer.next(zh);
                    break;
                case 'en':
                    observer.next(en);
            }

            observer.complete();
        });
    }
}

export function TranslateLoaderFactory() {
    return new CustomTranslateLoader();
}

@NgModule({
    declarations: [
        AppComponent,
        // RunningManagerComponent,
        SafePipe,
    ],
entryComponents: [SplashscreenPage, /*RunningManagerComponent */],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(), AppRoutingModule, FormsModule, DragulaModule.forRoot(),
        IonicStorageModule.forRoot({
            name: '__launcher.db',
            driverOrder: ['localstorage', 'indexeddb', 'sqlite', 'websql']
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (TranslateLoaderFactory)
            }
        }),
        SplashscreenPageModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        InAppBrowser,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

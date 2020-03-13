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

import { RunningAppsComponent } from './components/running-apps/running-apps.component';
import { AppmanagerService } from './services/appmanager.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export class CustomTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create(observer => {
            switch (lang) {
                case 'zh':
                    observer.next(zh);
                    break;
                case 'en':
                default:
                    observer.next(en);
                    break;
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
        RunningAppsComponent,
        NotificationsComponent,
        SafePipe,
    ],
entryComponents: [RunningAppsComponent, NotificationsComponent],
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
        BrowserAnimationsModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        InAppBrowser,
        AppmanagerService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';

import {ComponentsModule} from '../components/components.module'; // 引入模块

import {HomePage} from '../pages/home/home';
import {ManagePage} from '../pages/manage/manage';
import {InfoPage} from '../pages/info/info';
import {RunningPage} from '../pages/running/running';
import {RecentPage} from '../pages/recent/recent';
import {TabsPage} from '../pages/tabs/tabs';
import {MyPage} from '../pages/my/my';
import {ZipdirPage} from '../pages/zipdir/zipdir';

import {File} from '@ionic-native/file';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SQLite} from '@ionic-native/sqlite';
import {StatusBar} from '@ionic-native/status-bar';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ManagePage,
        InfoPage,
        RunningPage,
        RecentPage,
        TabsPage,
        MyPage,
        ZipdirPage
    ],
    imports: [
        BrowserModule,
        ComponentsModule,
        // IonicModule.forRoot(MyApp)
        IonicModule.forRoot(MyApp, {
            tabsHideOnSubPages: 'true', //隐藏全部子页面 tabs
            backButtonText: '' /*配置返回按钮*/
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ManagePage,
        InfoPage,
        RunningPage,
        RecentPage,
        TabsPage,
        MyPage,
        ZipdirPage
    ],
    providers: [
        File,
        SplashScreen,
        SQLite,
        StatusBar,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}

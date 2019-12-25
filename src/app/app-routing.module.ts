import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'my', loadChildren: './pages/my/my.module#MyPageModule' },
  { path: 'manager', loadChildren: './pages/manager/manager.module#ManagerPageModule' },
  { path: 'language', loadChildren: './pages/language/language.module#LanguagePageModule' },
  { path: 'wallpaper', loadChildren: './pages/wallpaper/wallpaper.module#WallpaperPageModule' },
  { path: 'iconsize', loadChildren: './pages/iconsize/iconsize.module#IconsizePageModule' },
  { path: 'about', loadChildren: './pages/about/about.module#AboutPageModule' },
  { path: 'share', loadChildren: './pages/share/share.module#SharePageModule' },
  { path: 'appinfo', loadChildren: './pages/appinfo/appinfo.module#AppinfoPageModule' },
  { path: 'splashscreen', loadChildren: './splash/splashscreen/splashscreen.module#SplashscreenPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

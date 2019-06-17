import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wallpaper',
  templateUrl: './wallpaper.page.html',
  styleUrls: ['./wallpaper.page.scss'],
})
export class WallpaperPage implements OnInit {

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

}

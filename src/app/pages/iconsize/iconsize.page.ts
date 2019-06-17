import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-iconsize',
  templateUrl: './iconsize.page.html',
  styleUrls: ['./iconsize.page.scss'],
})
export class IconsizePage implements OnInit {

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

}

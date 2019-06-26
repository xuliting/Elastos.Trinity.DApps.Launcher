import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'header-bar',
    templateUrl: './header-bar.component.html',
    styleUrls: ['./header-bar.component.scss'],
})
export class HeaderBarComponent implements OnInit {
    public back_touched = false;
    public _title: string = '';

    @Input()
    set title(title: string) {
        this._title = title;
    }

    constructor() { }

    ngOnInit() { }

}

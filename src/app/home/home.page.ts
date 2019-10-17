import { Component, ViewChild } from '@angular/core';
import { AppmanagerService } from "../services/appmanager.service";
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';
// import { SafePipe } from '../pipes/safe.pipe';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage {
	@ViewChild("drag") drag1: any;
	public list:any[]=[];
	public popup = false;
	public touched = false;

	constructor(
		public popoverController: PopoverController,
		public translate: TranslateService,
		// public safe: SafePipe,
		public appManager: AppmanagerService) {
  	}

	popoRunningManager(event: any) {
		console.log(this.appManager.runningList);
		this.popup = true;
		this.presentPopover(event).then();
	}

	async presentPopover(ev: any) {
		const popover = await this.popoverController.create({
			component: RunningManagerComponent,
			event: ev,
			translucent: true,
			cssClass: "my-custom-popup"
		});
		var me = this;
		popover.onDidDismiss().then(() => {me.popup = false});
		return await popover.present();
	}

	onClick(id) {
		this.appManager.start(id);
	}

	openScan() {
		this.appManager.sendIntent('scancode', null);
	}
}

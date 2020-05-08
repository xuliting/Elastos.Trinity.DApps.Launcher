import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

declare let appManager: AppManagerPlugin.AppManager;
declare let notificationManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {
  public notifications: any = [];

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.setNotificationListener();
    });
  }

  setNotificationListener() {
    notificationManager.setNotificationListener((notification) => {
      console.log('new notification:', notification);
      this.notifications.push(notification);
      titleBarManager.setBadgeCount(TitleBarPlugin.TitleBarIconSlot.OUTER_LEFT, this.notifications.length);
      // TODO toast
      // appManager.infoPrompt('Receive new notification', notification.title);
    });
  }

  async getNotifications() {
    const notifications = await notificationManager.getNotifications();
    this.notifications = notifications.notifications;
    console.log('getNotifications:', this.notifications);
    titleBarManager.setBadgeCount(TitleBarPlugin.TitleBarIconSlot.OUTER_LEFT, this.notifications.length);
  }

  deleteNotification(notificationId) {
    notificationManager.clearNotification(notificationId);
    this.notifications = this.notifications.filter((notification) => notification.notificationId !== notificationId);
    titleBarManager.setBadgeCount(TitleBarPlugin.TitleBarIconSlot.OUTER_LEFT, this.notifications.length);
  }

  fillAppInfoToNotification(allApps) {
    this.notifications.forEach(notification => {
      notification.app = allApps.find(app => app.id === notification.appId);
    });
  }
}

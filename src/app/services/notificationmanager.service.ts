import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

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
      if (!this.isValidNotification(notification)) {
        return;
      }

      // maybe update notification
      this.notifications = this.notifications.filter((item) => item.notificationId !== notification.notificationId);
      this.notifications.unshift(notification);
      this.updateBadge();
    });
  }

  async getNotifications() {
    const notifications = await notificationManager.getNotifications();
    this.notifications = notifications.notifications;
    this.clearUselessNotification();
    console.log('getNotifications:', this.notifications);
    this.updateBadge();
  }

  deleteNotification(notificationId) {
    notificationManager.clearNotification(notificationId);
    this.notifications = this.notifications.filter((item) => item.notificationId !== notificationId);
    this.updateBadge();
  }

  fillAppInfoToNotification(allApps) {
    this.clearUselessNotification();

    this.notifications.forEach(notification => {
      if (notification.appId === 'system') {
        notification['type'] = 'system';
      } else if (notification.emitter && (notification.emitter !== '')) {
        notification['type'] = 'contact';
      } else {
        notification['type'] = 'normal';
        notification.app = allApps.find(app => app.id === notification.appId);
        // if the app doesn't exist, delete the notificaiton automatically
        if (!notification.app) {
            notificationManager.clearNotification(notification.notificationId);
            notification.notificationId = -1;
        }
      }
    });

    this.notifications = this.notifications.filter((item) => item.notificationId !== -1);
    this.updateBadge();

    console.log('notifications:', this.notifications);
  }

  clearUselessNotification() {
    this.notifications.forEach((notification) => {
      if (!this.isValidNotification(notification)) {
        console.log('clearNotification ', notification.notificationId);
        notificationManager.clearNotification(notification.notificationId);
        notification.notificationId = -1;
      }
    });

    // remove from array
    this.notifications = this.notifications.filter((item) => item.notificationId !== -1);
  }

  // if no appid and no emitter, automatically delete the notification, because we don't know what to do with it.
  isValidNotification(notification) {
    if (notification.appId === '' && (!notification.emitter || notification.emitter === '')) {
      console.log('notification is invalid: ', notification);
      return false;
    }
    return true;
  }

  updateBadge() {
    titleBarManager.setBadgeCount(TitleBarPlugin.TitleBarIconSlot.OUTER_LEFT, this.notifications.length);
  }
}

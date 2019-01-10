# TL;DR
A elastos dapps runtime.


npm install cnpm -g --registry=https://registry.npm.taobao.org

##### 安装 ionic|cordova
> cnpm install -g ionic cordova 
##### 安装 依赖包
> cnpm install




# Build from platform

## Android
# 在nodej环境下的工程根目录下输入
1 ionic build --prod

2 拷贝 Elastos.Trinity.DApps.Launcher\www所有的文件到Elastos.Trinity.DApps.Launcher\platforms\android\app\src\main\assets\www\launcher目录下

3 启动Android studio  打开Elastos.Trinity.DApps.Launcher\platforms\android的工程



### Build Pre-Requirements  暂时先需要安装插件。插件已经安装好了

cordova plugin add https://github.com/elastos/Elastos.Trinity.Runtime.Plugins.AppManager.git#dev

cordova plugin add https://github.com/elastos/Elastos.Trinity.Runtime.Plugins.AppService.git#dev

#cordova plugin add https://github.com/elastos/Elastos.Trinity.Runtime.Plugins.PluginDemo.git#dev

cordova plugin add  https://github.com/elastos/Elastos.Trinity.Plugins.Device.git#dev

cordova plugin add https://github.com/elastos/Elastos.Trinity.Plugins.SplashScreen.git#dev

cordova plugin add https://github.com/apache/cordova-plugin-statusbar.git#dev

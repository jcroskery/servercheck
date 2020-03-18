"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Conf = Me.imports.conf.Conf;
const {Gio, GLib} = imports.gi;
const Soup = imports.gi.Soup;
const MessageTray = imports.ui.messageTray;
const Source = MessageTray.Source;
const Main = imports.ui.main;
const Util = imports.misc.util;

function init() {
    log('initializing ServerCheck');
}

function enable() {
    new Extension();
}

function disable() {
    log('disabling ServerCheck');
}

class Extension {
    constructor() {
        log('enabling ServerCheck');
        this.notificationShown = false;
        this.config = new Conf();
        this.checkMailTimeout = null;
        this.startTimeout();
        this.initialCheckMail = GLib.timeout_add_seconds(0, 5, () => {
            this._checkServer();
            return false;
        });
    }
    startTimeout() {
        this.checkMailTimeout = GLib.timeout_add_seconds(0, this.config.getTimer(), () => {
            this._checkServer();
            return true;
        });
    }
    _showNotification() {
        if (!this.notificationShown) {
            let source = new Source("ServerCheck", "dialog-error");
            Main.messageTray.add(source);
            let notification = new MessageTray.Notification(source, "Server Error", "Failed to connect to " + this.config.getServer(), {
                gicon: new Gio.ThemedIcon({ name: "dialog-error" })
            });
            notification.connect('activated', () => {
                const defaultBrowser = Gio.app_info_get_default_for_uri_scheme("http").get_executable();
                Util.trySpawnCommandLine(defaultBrowser + " " + this.config.getServer());
            });
            source.showNotification(notification);
            this.notificationShown = true;
        }
    }
    _checkServer() {
        log('Checking server');
        const msg = Soup.Message.new("GET", this.config.getServer());
        let Sess = new Soup.SessionAsync(); 
        Sess.timeout = 10;
        Sess.queue_message(msg, (_, msg) => {
            if (!msg || msg.status_code !== 200) {
                this._showNotification();
            } else {
                this.notificationShown = false;
            }
        });
    }
}

/*
 * Copyright (c) 2020 Justus Croskery
 * To contact me, email me at justus@olmmcc.tk.
 *
 * ServerCheck is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 *
 * ServerCheck is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with ServerCheck; if not, see <https://www.gnu.org/licenses/>.
 *
 */

"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Conf = Me.imports.conf.Conf;
const {Gio, GLib} = imports.gi;
const Soup = imports.gi.Soup;
const MessageTray = imports.ui.messageTray;
const Source = MessageTray.Source;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

let extension;

function init() {
    log("Initializing ServerCheck.");
}

function enable() {
    log("Enabling ServerCheck");
    extension = new Extension();
}

function disable() {
    log("Disabling ServerCheck.");
    extension._destroy();
}

class Extension {
    constructor() {
        this.notificationShown = false;
        this.config = new Conf();
        this.checkServerTimer = null;
        this.source = null;
        this.startTimeout();
        this.initialCheckServer = GLib.timeout_add_seconds(0, 5, () => {
            this._checkServer();
            return false;
        });
    }
    startTimeout() {
        this.checkServerTimer = GLib.timeout_add_seconds(0, this.config.getTimer(), () => {
            this._checkServer();
            return true;
        });
    }
    _showNotification() {
        if (!this.notificationShown) {
            this.source = new Source("ServerCheck", "dialog-error");
            Main.messageTray.add(this.source);
            let notification = new MessageTray.Notification(this.source, "Server Error", "Failed to connect to " + this.config.getServer(), {
                gicon: new Gio.ThemedIcon({ name: "dialog-error" })
            });
            notification.connect('activated', () => {
                const defaultBrowser = Gio.app_info_get_default_for_uri_scheme("http").get_executable();
                Util.trySpawnCommandLine(defaultBrowser + " " + this.config.getServer());
            });
            notification.setResident(true);
            this.source.showNotification(notification);
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
    _destroy() {
        Mainloop.source_remove(this.checkServerTimer);
        Mainloop.source_remove(this.initialCheckServer);
        this.source.destroy();
    }
}

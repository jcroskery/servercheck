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
const { Gio, GLib } = imports.gi;

var Conf = class {
    constructor() {
        this.settings = Conf.getSettings();
    }
    static getSettings() {
        let schemaName = 'org.gnome.shell.extensions.ServerCheck';
        let schemaDir = Me.dir.get_child('schemas').get_path();

        let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir,
            Gio.SettingsSchemaSource.get_default(),
            false);
        let schema = schemaSource.lookup(schemaName, false);

        return new Gio.Settings({ settings_schema: schema });
    }
    getTimer() {
        return this.settings.get_int('timer');
    }
    getServer() {
        return this.settings.get_string('server');
    }
    setTimer(timer) {
        this.settings.set_int('timer', timer);
    }
    setServer(server) {
        this.settings.set_string('server', server);
    }
}

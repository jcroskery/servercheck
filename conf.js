"use strict";
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GLib } = imports.gi;

var Conf = class {
    constructor(extension) {
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

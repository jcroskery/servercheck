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

const { GObject, Gtk, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Conf = Me.imports.conf.Conf;

function init() {
    log("Initializing ServerCheck Preferences");
}

function buildPrefsWidget() {
    const prefs = new Prefs();
    prefs.show_all();
    return prefs;
}

var Prefs = GObject.registerClass(class extends Gtk.Box {
    _init(params) {
        super._init(params);
        this.margin = 24;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._conf = new Conf();
        let server = this._conf.getServer();
        let timer = this._conf.getTimer();

        const hbox1 = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        const setting1_label = this._addLabel(hbox1, "Check every " + timer + " seconds: ");
        const adjustment = new Gtk.Adjustment({
            lower: 60,
            upper: 1800,
            step_increment: 1
        });
        const setting_slider = new Gtk.HScale({
            digits: 0,
            adjustment: adjustment,
            value_pos: Gtk.PositionType.RIGHT
        });
        setting_slider.set_value(timer);
        setting_slider.connect('value-changed', button => {
            let i = Math.round(button.get_value()).toString();
            setting1_label.label = "Check every " + i + " seconds: ";
            this._conf.setTimer(i);
        });
        hbox1.pack_end(setting_slider, true, true, 0);
        this.add(hbox1);
        const hbox2 = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        const setting2_label = this._addLabel(hbox2, "Server url: " + server);
        let entryBuffer = Gtk.EntryBuffer.new(server, server.length);
        const url = Gtk.Entry.new_with_buffer(entryBuffer);
        const button = Gtk.Button.new_with_label("Change Server");
        hbox2.pack_end(button, true, true, 0);
        button.connect('clicked', () => {
            let new_server = url.get_buffer().get_text();
            setting2_label.label = "Server url: " + new_server;
            this._conf.setServer(new_server);
        });
        hbox2.pack_end(url, true, true, 0);
        this.add(hbox2)
    }
    _addLabel(hbox, label) {
        const setting_label = new Gtk.Label({
            label: label,
            xalign: 0,
            use_markup: true
        });
        hbox.pack_start(setting_label, true, true, 0);
        return setting_label;
    }
});

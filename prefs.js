"use strict";

const { GObject, Gtk, GLib } = imports.gi;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Conf = Me.imports.conf.Conf;

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    log("Initializing ServerCheck Preferences");
}


// This function is called when the preferences window is first created to build
// and return a Gtk widget. As an example we'll create and return a GtkLabel.
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

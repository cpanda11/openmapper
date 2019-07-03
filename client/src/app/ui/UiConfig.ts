import * as Dat from "dat.gui";
import {EventHandler, EventTypes} from "../event/EventHandler";
import { Config } from "../../config";


//this thing makes the GUI menus
//and defines the keyboard shortcuts

interface IGuiItem {
    key: string;
    value?: any;
    keycode?: string;
    default?: any;
    fn: (value: any) => void;
}

interface IConfig {
    title: string;
    open: boolean;
    subitemsValues: IGuiItem[];
    subitemsButtons: IGuiItem[];
}

const config: IConfig[] = [
    {
        title: "View",
        open: true,
        subitemsValues: [
            {
                key: "Wireframe (w)",
                value: false,
                keycode: "KeyW",
                fn: (value) => EventHandler.throwEvent(EventTypes.Wireframe, value),
            },
            {
                key: "Outlines (o)",
                value: false,
                keycode: "KeyO",
                fn: (value) => EventHandler.throwEvent(EventTypes.Outlines, value),
            },
            {
                key: "Cutter (c)",
                keycode: "KeyC",
                value: true,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.Cutter, value),
            },

        ],
        subitemsButtons: [],
    },
    {
        title: "Surfaces",
        open: true,
        subitemsValues: [],
        subitemsButtons: [
            {
                key: "Add (q)",
                keycode: "KeyQ",
                value: true,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.NewQuad, value),
            },
            {
                key: "Save (s)",
                keycode: "KeyS",
                value: true,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.Save, value),
            },
            {
                key: "Load (l)",
                keycode: "KeyL",
                value: true,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.Load, value),
            },
        ],
    },
    {
        title: "Video",
        open: true,
        subitemsValues: [
            {
                key: "Play/Pause",
                keycode: "Space",
                value: true,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.PlayVideo, value),
            },
            {
                key: "Source",
                value: Config.Video.source,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.VideoSrc, value),
            },
            {
                key: "Speed",
                value: 1,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.VideoSpeed, value),
            },
            {
                key: "Webcam (i)",
                keycode: "KeyI",
                value: false,
                fn: (value: any) => EventHandler.throwEvent(EventTypes.WebCam, value),
            },
        ],
        subitemsButtons: [],
    },
];

class ConfigManager {
    public static generateConfig(config: IConfig[], fnSubitem: (conf: IConfig) => any, fnValue: (val: any) => any) {
        return config
            .map(fnSubitem)
            .reduce((a, b) => a.concat(b))
            .map(fnValue)
            .reduce((a, b) => {
                return {...a, ...b};
            });
    }
}

const controller = ConfigManager.generateConfig(config,
    (val) => val.subitemsValues,
    (val) => {
        const obj = {};
        obj[val.key] = val.value;
        return obj;
    });

const controllerButton = ConfigManager.generateConfig(config,
    (val) => val.subitemsButtons,
    (val) => {
        const obj = {};
        obj[val.key] = val.fn;
        return obj;
    });


// this should hide the gui menu
// might work after updating datgui: https://github.com/dataarts/dat.gui/issues/93
// https://github.com/dataarts/dat.gui/pull/216/commits/c0d09cf471af11e5f1bd2f72ed0f8f645b7fddf9

// is it because its an error in typescript, does it work with javascript???
// this is so fucking annyoing, can we just simulte a 'h' keypress to get rid of this
// or do I really need xdootool to do this ?

const initConfig: Dat.GUIParams = {

  /**
      * Hides the GUI.
      */
  //    hide: function() {
  //      this.domElement.style.display = 'none';
//      },

    //closed: true, //this still shows the open knob on top, which sucks
    //open: false,//this does nothing
    //close: true,//this does nothing
    //display: false,
    //hide: none,//this does nothing
    //show: false,//this does nothing
    //show: false,
    //hidden: true, //this does nothing

};

// create a gui element
const gui = new Dat.GUI(initConfig);
config.map((value: IConfig) => {

    const subfolder = gui.addFolder(value.title);
    if (value.open) {
        subfolder.open();
    }

    value.subitemsValues.map((subitem: IGuiItem) => {
        switch (typeof controller[subitem.key]) {
            case "object" :
                subfolder.add(controller, subitem.key, subitem.value).onChange(subitem.fn);

            default:
                subfolder.add(controller, subitem.key).onChange(subitem.fn);
        }
    });

    value.subitemsButtons.map((subitem: IGuiItem) => {
        subfolder.add(controllerButton, subitem.key);
    });
});

function getKeyCodes(conf: IConfig[]): IGuiItem[] {
    return conf
        .map((subconf: IConfig): IGuiItem[] =>
            subconf.subitemsValues.filter((guiItem: IGuiItem): boolean => "keycode" in guiItem))
        .reduce((a, b) => a.concat(b));
}

const keyItems: IGuiItem[] = getKeyCodes(config);

document.addEventListener("keydown", (event) => {
    keyItems
        .filter((keyItem: IGuiItem) => keyItem.keycode === event.code)
        .map((keyItem: IGuiItem) => {
            keyItem.value = !keyItem.value;
            return keyItem;
        })
        .map((keyItem: IGuiItem) => {
            config.forEach((conf: IConfig) => {
                gui.__folders[conf.title].__controllers
                    .filter(ctrl => ctrl.property === keyItem.key)
                    .map(ctrl => ctrl.setValue(keyItem.value));
            });
            keyItem.fn(keyItem.value);
            return keyItem;
        });
});

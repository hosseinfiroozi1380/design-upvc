// src/utils/setDefaultData.js
import state from '../core/state.js';
import { updateLayerDetailsMenuOptions } from './updateLayerDetailsMenuOptions.js';
import { resetProfileDataTypeOfWindowDoorSubItems } from '../items/resetProfileDataTypeOfWindowDoorSubItems.js';
import { reDrawItem } from '../drawing/reDrawItem.js';
import { reDrawMainFrame } from '../drawing/reDrawMainFrame.js';
import { enableSave } from '../services/enableSave.js';
// set items default components id
export function setDefaultData(item, type) { //type = resetAllProfiles, resetAllAccessories, resetAllGlasses, mainFrame, flat, mullian, panel, doorFrame, windowFrame, lace, coupling
    updateLayerDetailsMenuOptions();
    if (type == "resetAllProfiles") {
        let allItems = state.paper.project.activeLayer.getItems({
            name: function (value) {
                return ['vMullian', 'hMullian', 'mainFrame', 'windowFrame', 'doorFrame', 'vPanel', 'hPanel', 'flat'].includes(value);
            }
        });
        for (let index = (allItems.length - 1); index >= 0; index--) {
            if (allItems[index].name && allItems[index].name == "windowFrame") {
                let frame_profileWidth = allItems[index].data.profile_width;
                allItems[index].data.profile = state.firstWindowSash;
                allItems[index].data.profile_width = state.firstWindowSash_width;
                //change children profile to have a nice reDraw
                resetProfileDataTypeOfWindowDoorSubItems(allItems[index]);
                if (frame_profileWidth != state.firstWindowSash_width) {
                    reDrawItem(allItems[index]);
                }
            } else if (allItems[index].name && allItems[index].name == "doorFrame") {
                let frame_profileWidth = allItems[index].data.profile_width;
                allItems[index].data.profile = state.firstDoorSash;
                allItems[index].data.profile_width = state.firstDoorSash_width;
                //change children profile to have a nice reDraw
                resetProfileDataTypeOfWindowDoorSubItems(allItems[index]);
                if (frame_profileWidth != state.firstDoorSash_width) {
                    reDrawItem(allItems[index]);
                }
            } else if (allItems[index].name && allItems[index].name.indexOf('Panel') !== -1) {
                let frame_profileWidth = allItems[index].data.profile_width;
                allItems[index].data.profile = state.firstPanel;
                allItems[index].data.profile_width = state.firstPanel_width;
                if (frame_profileWidth != state.firstPanel_width) {
                    reDrawItem(allItems[index]);
                }
            } else if (allItems[index].name && allItems[index].name.indexOf('Mullian') !== -1) {
                let frame_profileWidth = allItems[index].data.profile_width;
                allItems[index].data.profile = state.firstMullian;
                allItems[index].data.profile_width = state.firstMullian_width;
                if (frame_profileWidth != state.firstMullian_width) {
                    reDrawItem(allItems[index]);
                }
            } else if (allItems[index].name && allItems[index].name.indexOf('flat') !== -1 || allItems[index].name && allItems[index].name.indexOf('base') !== -1) {
                allItems[index].data.glazing = state.firstGlazing;
            } else if (allItems[index].name && allItems[index].name.indexOf("mainFrame") !== -1) {
                let frame_profileWidth = allItems[index].data.profile_width;
                allItems[index].data.profile = state.firstFrame;
                allItems[index].data.profile_width = state.firstFrame_width;
                allItems[index].data.cornic = state.firstCornic;
                allItems[index].data.bottomdoor = state.firstBottomDoor;
                allItems[index].data.threshold = state.firstThreshold;
                if (frame_profileWidth != state.firstFrame_width) {
                    reDrawMainFrame(allItems[index].parent);
                }
            }
        }
    } else if (type == "resetAllProfilesColors") {
        let allitems = state.paper.project.activeLayer.getItems({
            name: function (value) {
                return ['vMullian', 'hMullian', 'mainFrame', 'windowFrame', 'doorFrame', 'hinge', 'handle', 'handleHand', 'vPanel', 'hPanel'].includes(value);
            }
        });
        for (let n = 0; n < allitems.length; n++) {
            allitems[n].fillColor = state.unitData['profile_color_hex'];
        }
    } else if (type == "resetAllAccessories") {
        let allItems = state.paper.project.activeLayer.getItems({
            name: function (value) {
                return ['windowFrame', 'doorFrame'].includes(value);
            }
        });
        for (let index = 0; index < allItems.length; index++) {
            if (typeof allItems[index].data == "undefined") {
                allItems[index].data = {};
                allItems[index].data.profile = state.firstDoorSash;
                allItems[index].data.profile_width = state.firstDoorSash_width;
                allItems[index].data.lace = state.firstLace;
            }
            allItems[index].data.accessory = state.firstAccessory;
            allItems[index].data.accessoryType = state.firstAccessoryType;
            allItems[index].data.lockType = state.firstLockType;
        }
    } else if (type == "resetAllGlasses") {
        state.flatColor = new state.paper.Color(state.firstGlassColor);
        let allItems = state.paper.project.activeLayer.getItems({
            name: function (value) {
                return ['flat', 'base'].includes(value);
            }
        });
        for (let index = 0; index < allItems.length; index++) {
            if (typeof allItems[index].data == "undefined") {
                allItems[index].data = {};
                allItems[index].data.lace = state.firstLace;
                allItems[index].data.profile = state.firstFrame; //set frame for no opening. after change to opening it should change to sash frame
            }
            allItems[index].data.glass = state.firstGlass;
            allItems[index].fillColor = state.flatColor;
            allItems[index].data.glazing = state.firstGlazing;
        }
    } else {
        item.data = {};
        if (type == "mainFrame") {
            item.data.profile = state.firstFrame;
            item.data.profile_width = state.firstFrame_width;
            item.data.cornic = state.firstCornic;
            item.data.bottomdoor = state.firstBottomDoor;
            item.data.threshold = state.firstThreshold;
        } else if (type == "flat") {
            item.data.glass = state.firstGlass;
            item.data.glazing = state.firstGlazing;
            state.flatColor = new state.paper.Color(state.firstGlassColor);
        } else if (['mullian', 'vMullian', 'hMullian'].includes(type)) {
            item.data.profile = state.firstMullian;
            item.data.profile_width = state.firstMullian_width;
            item.data.overhung = 0;
        } else if (['panel', 'vPanel', 'hPanel'].includes(type)) {
            item.data.profile = state.firstPanel;
            item.data.glazing = state.firstGlazing;
            item.data.profile_width = state.firstPanel_width;
        } else if (type == "doorFrame") {
            item.data.profile = state.firstDoorSash;
            item.data.lace = state.firstLace;
            item.data.accessory = state.firstAccessory;
            item.data.accessoryType = state.firstAccessoryType;
            item.data.lockType = state.firstLockType;
            item.data.profile_width = state.firstDoorSash_width;
        } else if (type == "windowFrame") {
            item.data.profile = state.firstWindowSash;
            item.data.lace = state.firstLace;
            item.data.accessory = state.firstAccessory;
            item.data.accessoryType = state.firstAccessoryType;
            item.data.lockType = state.firstLockType;
            item.data.profile_width = state.firstWindowSash_width;
        } else if (type == "lace") {
            item.data.lace = state.firstLace;
        } else if (type == "coupling") {
            item.data.profile = state.firstCoupling;
            item.data.profile_width = state.firstCoupling_width;
        }
    }
    enableSave();
}
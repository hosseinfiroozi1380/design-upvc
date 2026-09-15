// src/drawing/reDrawMainFrame.js
import state from "../core/state.js";
import { drawFirstShape } from "./drawFirstShape.js";
import { addMullian } from "../items/addMullian.js";
import { addSlide } from "../items/addSlide.js";
import { addWindow } from "../items/addWindow.js";
import { addDoor } from "../items/addDoor.js";
import { addPanel } from "../items/addPanel.js";
import { createDimensionBar } from "./createDimensionBar.js";
import { setZoom } from "../events/setZoom.js";
import { showMessage } from "../utils/showMessage.js";
import { filterAutomateCreationBtns } from "../utils/filterAutomateCreationBtns.js";
export function reDrawMainFrame(section, changeSize = false) {
    if (changeSize) {
        if (
            Number(changeSize[0]) < 200 ||
            Number(changeSize[1]) < 200 ||
            Number(changeSize[0]) > 6000 ||
            Number(changeSize[1]) > 6000
        ) {
            showMessage(
                'لطفا ابعاد معتبری وارد نمایید. حداقل 200 حداکثر 6000 میلیمتر'
            );
            return false;
        }
    }
    if (!section) {
        section = state.paper.project.activeLayer.getItem({
            name: "section"
        });
    }
    let mainFrame = section.children.find(
        item => item.name === "mainFrame"
    );
    if(!mainFrame){
        return false;
    }
    state.frameSize = mainFrame.data.profile_width;
    state.frameColor = state.unitData.profile_color_hex;
    if (changeSize) {
        state.newWidth = Number(changeSize[0]);
        state.newHeight = Number(changeSize[1]);
        state.unitData.dimension = changeSize;
    } else {
        state.newWidth = section.bounds.width;
        state.newHeight = section.bounds.height;
    }
    let oldSection = section;
    section.remove();
    drawFirstShape(
        state.unitData,
        true,
        mainFrame.data,
        oldSection
    );
    let windowsMullianMemory = [];
    if (state.unitData.type !== "Slide") {
        let mullians = oldSection.getItems({
            name(value) {
                return [
                    "vMullian",
                    "hMullian"
                ].includes(value);
            }
        });
        $.each(mullians, function (key, mullian) {
            if (
                mullian.parent.parent.name.indexOf("window_") !== -1 ||
                mullian.parent.parent.name.indexOf("door_") !== -1
            ) {
                windowsMullianMemory.push(mullian);
                return;
            }
            let flats =
                state.paper.project.activeLayer.getItems({
                    name: "flat"
                });
            $.each(flats, function (key2, flat) {
                if (flat.hitTest(mullian.bounds.center)) {
                    if (mullian.bounds.width > 3) {
                        addMullian(
                            mullian.name,
                            flat,
                            mullian.bounds.center,
                            flat.parent,
                            mullian.data,
                            false
                        );
                    }
                    return;
                }
            });
        });
    }
    let others = oldSection.getItems({
        name(value) {
            return (
                value.indexOf("window_") !== -1 ||
                value.indexOf("door_") !== -1
            );
        }
    });
    $.each(others, function (key, item) {
        let flats =
            state.paper.project.activeLayer.getItems({
                name: "flat"
            });
        $.each(flats, function (key2, flat) {
            if (!flat.hitTest(item.bounds.center)) {
                return;
            }
            let openingFlatData = false;
            let openingFlatFillColor = false;
            item.children.forEach(child => {
                if (child.name === "flat") {
                    openingFlatData = child.data;
                    openingFlatFillColor = child.fillColor;
                }
            });
            if (item.name.indexOf("window_") !== -1) {
                if (item.name === "window_slide") {
                    addSlide(
                        flat,
                        false,
                        false,
                        item.data
                    );
                    return;
                }
                let window = addWindow(
                    item.name,
                    flat,
                    flat.parent,
                    {
                        profile: item.children[0].data,
                        flat: openingFlatData,
                        flatFillColor: openingFlatFillColor
                    }
                );
                $.each(
                    windowsMullianMemory,
                    function(key3, mullian) {
                        let windowFlats =
                            window.getItems({
                                name:"flat"
                            });
                        $.each(windowFlats,function(key4,windowFlat){
                            if(
                                windowFlat.hitTest(
                                    mullian.bounds.center
                                )
                            ){
                                addMullian(
                                    mullian.name,
                                    windowFlat,
                                    mullian.bounds.center,
                                    windowFlat.parent,
                                    mullian.data,
                                    false
                                );
                            }
                        });
                    }
                );
            } else if (item.name.indexOf("door_") !== -1) {
                let door = addDoor(
                    item.name,
                    flat,
                    flat.parent,
                    {
                        profile:item.children[0].data,
                        flat:openingFlatData,
                        flatFillColor:openingFlatFillColor
                    }
                );
                $.each(
                    windowsMullianMemory,
                    function(key3,mullian){
                        let doorFlats =
                            door.getItems({
                                name:"flat"
                            });
                        $.each(
                            doorFlats,
                            function(key4,doorFlat){
                                if(
                                    doorFlat.hitTest(
                                        mullian.bounds.center
                                    )
                                ){
                                    addMullian(
                                        mullian.name,
                                        doorFlat,
                                        mullian.bounds.center,
                                        doorFlat.parent,
                                        mullian.data,
                                        false
                                    );
                                }
                            }
                        );
                    }
                );
            }
        });
    });
    let panels = oldSection.getItems({
        name(value){
            return value.indexOf("Panel") !== -1;
        }
    });
    $.each(panels,function(key,item){
        let flats =
            state.paper.project.activeLayer.getItems({
                name:"flat"
            });
        $.each(flats,function(key2,flat){
            if(flat.hitTest(item.bounds.center)){
                addPanel(
                    item.name,
                    flat,
                    flat.parent,
                    item.data
                );
            }
        });
    });
    createDimensionBar();
    setZoom();
    filterAutomateCreationBtns();
}
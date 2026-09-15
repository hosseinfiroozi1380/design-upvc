// src/drawing/reDrawItem.js
import state from "../core/state.js";
import { reDrawMainFrame } from "./reDrawMainFrame.js";
import { deleteItem } from "../utils/deleteItem.js";
import { addWindow } from "../items/addWindow.js";
import { addDoor } from "../items/addDoor.js";
import { addPanel } from "../items/addPanel.js";
import { reDrawMullianChildsOnDelete } from "./reDrawMullianChildsOnDelete.js";
import { changeMullianPosition } from "../items/changeMullianPosition.js";
import { createDimensionBar } from "./createDimensionBar.js";

export function reDrawItem(
    item,
    newProfileWidth = false
) {
    if (item.name === "mainFrame") {
        reDrawMainFrame(item.parent);
    } else if (
        item.name === "windowFrame" ||
        item.name === "doorFrame"
    ) {
        let itemParent = item.parent;
        let memory = deleteItem(itemParent);
        let flats = state.paper.project.activeLayer.getItems({
            name: "flat"
        });
        $.each(flats, function (key, flat) {
            if (flat.hitTest(itemParent.bounds.center)) {
                let openingFlatData = false;
                let openingFlatFillColor = false;
                for (let k = 0; k < itemParent.children.length; k++) {
                    if (itemParent.children[k].name === "flat") {
                        openingFlatData =
                            itemParent.children[k].data;
                        openingFlatFillColor =
                            itemParent.children[k].fillColor;
                        break;
                    }
                }
                if (item.name === "windowFrame") {
                    addWindow(
                        itemParent.name,
                        flat,
                        flat.parent,
                        {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        }
                    );
                } else {
                    addDoor(
                        itemParent.name,
                        flat,
                        flat.parent,
                        {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        }
                    );
                }
                reDrawMullianChildsOnDelete(memory);
                return;
            }
        });
    } else if (
        item.name === "vPanel" ||
        item.name === "hPanel"
    ) {
        deleteItem(item);
        let flats = state.paper.project.activeLayer.getItems({
            name: "flat"
        });
        $.each(flats, function (key, flat) {
            if (flat.hitTest(item.bounds.center)) {
                addPanel(
                    item.name,
                    flat,
                    flat.parent,
                    item.data
                );
                return;
            }
        });
    } else if (
        item.name === "vMullian" ||
        item.name === "hMullian"
    ) {
        changeMullianPosition(
            new state.paper.Point(
                item.bounds.centerX + 1,
                item.bounds.centerY + 1
            )
        );
    } else if (item.name === "vCoupling") {
        let movement =
            Number(newProfileWidth) - item.bounds.width;
        let vCoupling =
            state.paper.project.activeLayer.getItems({
                name: "vCoupling"
            });
        let hCoupling =
            state.paper.project.activeLayer.getItems({
                name: "hCoupling"
            });
        let sections =
            state.paper.project.activeLayer.getItems({
                name: "section"
            });
        for (let n = 0; n < vCoupling.length; n++) {
            if (vCoupling[n].id === item.id) {
                item.segments[2].point.x += movement;
                item.segments[3].point.x += movement;
            }
            if (
                vCoupling[n].bounds.topLeft.x >
                item.bounds.topLeft.x
            ) {
                vCoupling[n].position.x += movement;
            }
        }
        for (let n = 0; n < hCoupling.length; n++) {
            if (
                hCoupling[n].bounds.topLeft.x >
                item.bounds.topLeft.x
            ) {
                hCoupling[n].position.x += movement;
            }
        }
        for (let n = 0; n < sections.length; n++) {
            if (
                sections[n].bounds.topLeft.x >
                item.bounds.topLeft.x
            ) {
                sections[n].position.x += movement;
            }
        }
    } else if (item.name === "hCoupling") {
        let movement =
            Number(newProfileWidth) - item.bounds.height;
        let vCoupling =
            state.paper.project.activeLayer.getItems({
                name: "vCoupling"
            });
        let hCoupling =
            state.paper.project.activeLayer.getItems({
                name: "hCoupling"
            });
        let sections =
            state.paper.project.activeLayer.getItems({
                name: "section"
            });
        for (let n = 0; n < vCoupling.length; n++) {
            if (
                vCoupling[n].bounds.topLeft.y >
                item.bounds.topLeft.y
            ) {
                vCoupling[n].position.y += movement;
            }
        }
        for (let n = 0; n < hCoupling.length; n++) {
            if (hCoupling[n].id === item.id) {
                item.segments[0].point.y += movement;
                item.segments[3].point.y += movement;
            }
            if (
                hCoupling[n].bounds.topLeft.y >
                item.bounds.topLeft.y
            ) {
                hCoupling[n].position.y += movement;
            }
        }
        for (let n = 0; n < sections.length; n++) {
            if (
                sections[n].bounds.topLeft.y >
                item.bounds.topLeft.y
            ) {
                sections[n].position.y += movement;
            }
        }
    }
    $("#configMenuDropDown").trigger("click");
    createDimensionBar();
    state.paper.project.deselectAll();
}
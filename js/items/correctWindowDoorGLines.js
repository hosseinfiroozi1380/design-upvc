// src/items/correctWindowDoorGLines.js
import state from "../core/state.js";
export function correctWindowDoorGLines() {
    let allWindows = state.paper.project.activeLayer.getItems({
        name: function (value) {
            return value && (value.indexOf("window_") !== -1 || value.indexOf("door_") !== -1);
        }
    });
    $.each(allWindows, function (key, item) {
        $.each(item.children, function (s, child) {
            if (child.name == "baseGroup") {
                child.sendToBack();
            }
        });
        $.each(item.children, function (v, child) {
            if (["windowFrame", "doorFrame"].includes(child.name)) {
                child.sendToBack();
            }
        });
    });
}
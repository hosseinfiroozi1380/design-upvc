// src/utils/itemsDimensionText.js
import state from '../core/state.js';
import { findGlassMargin } from "./findGlassMargin.js";
import { round2decimal } from "./round2decimal.js";
// Flats Dimension Text
export function itemsDimensionText() {
    let flatDimensions = state.paper.project.activeLayer.getItems({
        name: "dimensionText"
    });
    $.each(flatDimensions, function (key, item) {
        item.remove();
    });
    let flats = state.paper.project.activeLayer.getItems({
        name: "flat"
    });
    // $.each(flats, function (key, flat) {
    //     state.glassMarginInsideProfile =
    //         findGlassMargin(flat.parent.name);
    //     let newItem = PaperOffset.offset(
    //         flat,
    //         -state.glassMarginInsideProfile
    //     );
    //     let text = new state.paper.PointText({
    //         point: flat.bounds.center,
    //         content:
    //             round2decimal(newItem.bounds.width) +
    //             "x" +
    //             round2decimal(newItem.bounds.height),
    //         fillColor: "grey",
    //         justification: "center",
    //         fontSize: 40
    //     });
    //     newItem.remove();
    //     text.name = "dimensionText";
    //     text.parent = flat.parent;
    // });
    let winDoors = state.paper.project.activeLayer.getItems({ 
        name: function (value) { 
            return value &&
                   (
                       value.indexOf('window_') !== -1 ||
                       value.indexOf('door_') !== -1
                   );
        } 
    });
    // $.each(winDoors, function (key, item) {
    //     let dFrames = item.getItems({
    //         name: function (value) {
    //             return [
    //                 'windowFrame',
    //                 'doorFrame'
    //             ].includes(value);
    //         }
    //     });
    //     $.each(dFrames, function (key2, frame) {
    //         let text = new state.paper.PointText({
    //             point: [
    //                 frame.bounds.topCenter.x,
    //                 frame.bounds.bottomCenter.y - 15
    //             ],
    //             content:
    //                 round2decimal(frame.bounds.width) +
    //                 "x" +
    //                 round2decimal(frame.bounds.height),
    //             fillColor: "grey",
    //             justification: "center",
    //             fontWeight: "bold",
    //             fontSize: 40
    //         });
    //         text.name = "dimensionText";
    //         text.parent = item.parent;
    //     });
    // });
    let panels = state.paper.project.activeLayer.getItems({
        name: function (value) {
    
            return value &&
                   value.indexOf('Panel') !== -1;
    
        }
    });
    // $.each(panels, function (key, item) {
    //     state.glassMarginInsideProfile =
    //         findGlassMargin(item.parent.parent.name);
    //     let text = new state.paper.PointText({
    //         point: item.bounds.center,
    //         content:
    //             round2decimal(
    //                 item.bounds.width -
    //                 (state.glassMarginInsideProfile * 2)
    //             )
    //             +
    //             "x" +
    //             round2decimal(
    //                 item.bounds.height -
    //                 (state.glassMarginInsideProfile * 2)
    //             ),
    //         fillColor: "grey",
    //         justification: "center",
    //         fontSize: 40
    //     });
    //     text.name = "dimensionText";
    //     text.parent = item;
    // });
}
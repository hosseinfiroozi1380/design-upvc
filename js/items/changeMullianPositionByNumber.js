// src/items/changeMullianPositionByNumber.js
import state from '../core/state.js';
import { changeMullianPosition } from './changeMullianPosition.js';
import { round2decimal } from '../utils/round2decimal.js';
// change mullian position by xBar and yBar changes
export function changeMullianPositionByNumber(arg) { //arg = {from,to,label,mullianType, sectionID}
    let from = Number(arg.from);
    let to = Number(arg.to);
    let label = Number(arg.label);
    let mullianType = arg.mullianType;
    let section = state.paper.project.activeLayer.getItem({ id: arg.sectionID });
    if (!section) {
        return;
    }
    if (from != to) {
        if ((mullianType == "vMullian" && from == section.bounds.width) || (mullianType == "hMullian" && from == section.bounds.height)) { //last item
            let allMullians = state.paper.project.activeLayer.getItems({
                name: mullianType
            });
            $.each(allMullians, function (key, mullian) {
                let contactPoint = (mullianType == "vMullian") ? new state.paper.Point(from - label, mullian.bounds.centerY) : new state.paper.Point(mullian.bounds.centerX, from - label);
                if (mullian.hitTest(contactPoint)) {
                    mullian.selected = true;
                    state.selectedItem = mullian;
                    let desirePoint = (mullianType == "vMullian") ? new state.paper.Point(mullian.bounds.centerX + from - to, mullian.bounds.centerY) : new state.paper.Point(mullian.bounds.centerX, mullian.bounds.centerY + from - to);
                    changeMullianPosition(desirePoint);
                    return;
                }
            });
        } else { //other item
            let allMullians = state.paper.project.activeLayer.getItems({
                name: mullianType
            });
            $.each(allMullians, function (key, mullian) {
                let center = (mullianType == "vMullian") ? mullian.bounds.centerX : mullian.bounds.centerY;
                if (round2decimal(center) == round2decimal(from)) {
                    mullian.selected = true;
                    state.selectedItem = mullian;
                    let desirePoint = (mullianType == "vMullian") ? new state.paper.Point(to, mullian.bounds.centerY) : new state.paper.Point(mullian.bounds.centerX, to);
                    changeMullianPosition(desirePoint);
                    return;
                }
            });
        }
    }
}
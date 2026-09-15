// src/items/calcPanel.js
import state from '../core/state.js';
import {
    angleCorrection
} from "../utils/angleCorrection.js";
import {
    round2decimal
} from "../utils/round2decimal.js";
// calculate panel
export function calcPanel(arg) { //arg{id, item, type, parent}
    if (arg.item) {
        for (let index = 0; index < arg.item.children.length; index++) {
            let angles = {};
            let sides = {};
            let dimensions = {};
            let angles_glazing = {};
            let sides_glazing = {};
            let dimensions_glazing = {};
            let stat;
            if (arg.item.children[index].name == "panelItem") {
                for (let i = 0; i < arg.item.children[index].curves.length; i++) {
                    angles[i] = angleCorrection(
                        180 - round2decimal(
                            arg.item.children[index].curves[i]
                                .getTangentAt(0.001, true)
                                .getAngle(
                                    arg.item.children[index].curves[i]
                                        .previous
                                        .getTangentAt(0.999, true)
                                )
                        )
                    );
                    sides[i] = round2decimal(
                        arg.item.children[index].curves[i].length
                    );
                }
                dimensions = {
                    width: round2decimal(
                        arg.item.children[index].bounds.width
                    ),
                    height: round2decimal(
                        arg.item.children[index].bounds.height
                    )
                };
                if (arg.type == "vPanel") {
                    stat = 'Vertical';
                } else {
                    stat = 'Horizontal';
                }
                state.calculations['panel'][arg.id + '_' + index] = {
                    id: arg.id,
                    type: arg.type,
                    sides: sides,
                    bounds: {
                        width: dimensions.width,
                        height: dimensions.height
                    },
                    length: Math.max(...Object.values(sides)),
                    angles: angles,
                    components: arg.item.data,
                    parent: arg.parent,
                    stat: stat,
                    path: arg.item.children[index].getPathData(),
                }
            } else if (arg.item.children[index].name == "panelBase") {
                for (let j = 0; j < arg.item.children[index].curves.length; j++) {
                    let ni = 180 - round2decimal(
                        arg.item.children[index].curves[j]
                            .getTangentAt(0.001, true)
                            .getAngle(
                                arg.item.children[index].curves[j]
                                    .previous
                                    .getTangentAt(0.999, true)
                            )
                    );
                    angles_glazing[j] = angleCorrection(
                        round2decimal(ni / 2)
                    );
                    sides_glazing[j] = round2decimal(
                        arg.item.children[index].curves[j].length
                    );
                }
                dimensions_glazing = {
                    width: round2decimal(
                        arg.item.bounds.width
                    ),
                    height: round2decimal(
                        arg.item.bounds.height
                    )
                };
                arg.item.data['profile'] = arg.item.data['profile'];
                state.calculations["glazing"][arg.id] = {
                    // id: arg.item.data.glazing,
                    id: arg.id,
                    type: "glazing",
                    sides: sides_glazing,
                    angles: angles_glazing,
                    components: arg.item.data,
                }
            }
        }
    }
}
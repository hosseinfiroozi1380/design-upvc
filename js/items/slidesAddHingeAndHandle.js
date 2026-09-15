// src/items/slidesAddHingeAndHandle.js
import state from '../core/state.js';
import { addHingeAndHandle } 
from './addHingeAndHandle.js';
import PaperOffset 
from '../utils/PaperOffset.js';
// Add hinge and handle for slide windows
export function slidesAddHingeAndHandle(frameToAdd, direction, slideCount = 1) {
    let overlap = (slideCount == 2) ? 32 : 50;
    if (direction === "l") {
        //add Opening Line
        let from = [frameToAdd.bounds.rightCenter.x - frameToAdd.bounds.width / 5, frameToAdd.bounds.rightCenter.y + frameToAdd.bounds.height / 3];
        let to = [frameToAdd.bounds.leftCenter.x + frameToAdd.bounds.width / 5, frameToAdd.bounds.leftCenter.y + frameToAdd.bounds.height / 3];
        let olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        from = [to[0] + 100, to[1] - 100];
        olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        from = [to[0] + 100, to[1] + 100];
        olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        //add Handle
        let flatN = frameToAdd.getItem({ name: "flat" });
        if (flatN) {
            let flatToAddNew = PaperOffset.offset(flatN, overlap);
            addHingeAndHandle("window", flatToAddNew, frameToAdd, false, "right", false);
            flatToAddNew.remove();
        }
    } else if (direction === "r") {
        //add Opening Line
        let from = [frameToAdd.bounds.leftCenter.x + frameToAdd.bounds.width / 5, frameToAdd.bounds.leftCenter.y + frameToAdd.bounds.height / 3];
        let to = [frameToAdd.bounds.rightCenter.x - frameToAdd.bounds.width / 5, frameToAdd.bounds.rightCenter.y + frameToAdd.bounds.height / 3];
        let olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        from = [to[0] - 100, to[1] - 100];
        olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        from = [to[0] - 100, to[1] + 100];
        olPath = new state.paper.Path.Line(from, to);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = 'ol';
        frameToAdd.addChild(olPath);
        //add Handle
        let flatN = frameToAdd.getItem({ name: "flat" });
        if (flatN) {
            let flatToAddNew = PaperOffset.offset(flatN, overlap);
            addHingeAndHandle("window", flatToAddNew, frameToAdd, false, "left", false);
            flatToAddNew.remove();
        }
    }
}
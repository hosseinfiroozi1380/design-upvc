// src/utils/extendSectionDelete.js
import state from '../core/state.js';

// find side Coupling and Section for delete function
export function extendSectionDelete(section) {
    let bounds = section.bounds.clone();
    section.remove();
    let leftCoupling = state.paper.project.activeLayer.hitTest([
        bounds.topLeft.x - 1,
        bounds.topLeft.y
    ]);
    if (
        leftCoupling &&
        leftCoupling.item.name == "vCoupling"
    ) {
        leftCoupling.item.remove();
    }
    let topCoupling = state.paper.project.activeLayer.hitTest([
        bounds.topLeft.x,
        bounds.topLeft.y - 1
    ]);
    if (
        topCoupling &&
        topCoupling.item.name == "hCoupling"
    ) {
        topCoupling.item.remove();
    }
    let allSections = state.paper.project.activeLayer.getItems({
        name: "section"
    });
    let vCoupling = state.paper.project.activeLayer.hitTest([
        bounds.topRight.x + 1,
        bounds.topRight.y
    ]);
    if (
        vCoupling &&
        vCoupling.item.name == "vCoupling"
    ) {
        let vCouplingBounds = vCoupling.item.bounds.clone();
        vCoupling.item.remove();
        for (let n = 0; n < allSections.length; n++) {
            if (
                allSections[n].bounds.topLeft.x ==
                vCouplingBounds.topRight.x &&
                allSections[n].bounds.topLeft.y ==
                vCouplingBounds.topRight.y
            ) {
                extendSectionDelete(allSections[n]);
                break;
            }
        }
    }
    let hCoupling = state.paper.project.activeLayer.hitTest([
        bounds.bottomLeft.x,
        bounds.bottomLeft.y + 1
    ]);
    if (
        hCoupling &&
        hCoupling.item.name == "hCoupling"
    ) {
        let hCouplingBounds = hCoupling.item.bounds.clone();
        hCoupling.item.remove();
        for (let n = 0; n < allSections.length; n++) {
            if (
                allSections[n].bounds.topLeft.x ==
                hCouplingBounds.bottomLeft.x &&
                allSections[n].bounds.topLeft.y ==
                hCouplingBounds.bottomLeft.y
            ) {
                extendSectionDelete(allSections[n]);
                break;
            }
        }
    }
}
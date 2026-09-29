// js/events/setZoom.js
import state from "../core/state.js";
export function setZoom() {
    console.log("========== SET ZOOM ==========");
    const canvas =
        document.getElementById("myCanvas");
    if (!canvas || !state.paper) {
        return;
    }
    const cssWidth =
        canvas.clientWidth;
    const cssHeight =
        canvas.clientHeight;
    const project =
        state.paper.project;
    const activeLayer =
        project?.activeLayer;
    if (!activeLayer) {
        return;
    }
    let design = null;
    if (
        state.mainSection &&
        state.mainSection.isInserted
    ) {
        design =
            state.mainSection;
        console.log(
            "ACTIVE DESIGN FROM state.mainSection:",
            design
        );
    }
    if (!design && state.currentDesignID) {
        const sections =
            activeLayer.getItems({
                name: "section"
            });
        const targetSection =
            sections.find(
                section => {
                    const designID =
                        section?.data?.designID;
                    return (
                        String(designID) ===
                        String(state.currentDesignID)
                    );
                }
            );
        if (targetSection) {
            design =
                targetSection;
            console.log(
                "ACTIVE DESIGN FROM currentDesignID:",
                state.currentDesignID
            );
        }
    }
    if (!design) {
        const sections =
            activeLayer.getItems({
                name: "section"
            });
        if (sections.length === 1) {
            design =
                sections[0];
        }
    }
    if (!design) {
        const mainFrames =
            activeLayer.getItems({
                name: "mainFrame"
            });
        if (mainFrames.length === 1) {
            design =
                mainFrames[0];
        }
    }
    if (!design) {
        console.warn(
            "طراحی فعال برای Zoom پیدا نشد."
        );
        return;
    }
    const bounds =
        design.bounds.clone();
    const hasBounds =
        bounds &&
        bounds.width > 0 &&
        bounds.height > 0;
    if (!hasBounds) {
        console.warn(
            "Bounds طراحی فعال معتبر نیست."
        );
        return;
    }
    const designWidth =
        bounds.width;
    const designHeight =
        bounds.height;
    const isMobile =
        window.innerWidth <= 768;
    const padding =
        isMobile
            ? 0.43
            : 0.45;
    const usableWidth =
        cssWidth * padding;
    const usableHeight =
        cssHeight * padding;
    const scaleX =
        usableWidth /
        designWidth;
    const scaleY =
        usableHeight /
        designHeight;
    const scale =
        Math.min(
            scaleX,
            scaleY
        );
    console.log(
        "========== ACTIVE DESIGN =========="
    );
    console.log(
        "Current Design ID:",
        state.currentDesignID
    );
    console.log(
        "Active Section:",
        design
    );
    console.log(
        "Design Bounds:",
        bounds
    );
    console.log(
        "Design Width:",
        designWidth
    );
    console.log(
        "Design Height:",
        designHeight
    );
    console.log(
        "Canvas:",
        cssWidth,
        cssHeight
    );
    console.log(
        "Scale X:",
        scaleX
    );
    console.log(
        "Scale Y:",
        scaleY
    );
    console.log(
        "Final Zoom:",
        scale
    );
    state.paper.view.zoom =
        scale;
    state.paper.view.center =
        bounds.center;
    state.paper.view.update();
    console.log(
        "========== ZOOM FINAL CHECK =========="
    );
    console.log(
        "Current Design ID:",
        state.currentDesignID
    );
    console.log(
        "View Zoom:",
        state.paper.view.zoom
    );
    console.log(
        "View Center:",
        state.paper.view.center
    );
    console.log(
        "Design Center:",
        bounds.center
    );
    console.log(
        "Canvas:",
        canvas.clientWidth,
        canvas.clientHeight
    );
    console.log(
        "Canvas Actual:",
        canvas.width,
        canvas.height
    );
    console.log(
        "Design Size:",
        bounds.width,
        bounds.height
    );
    console.log(
        "Screen Size:",
        bounds.width *
        state.paper.view.zoom,
        bounds.height *
        state.paper.view.zoom
    );
    console.log(
        "======================================"
    );
    $("#rangeInput").val(
        scale
    );
    $("#myCanvas")
        .off("mousewheel.setZoom")
        .on(
            "mousewheel.setZoom",
            function (event) {
                event.preventDefault();
                const oldZoom =
                    state.paper.view.zoom;
                const newZoom =
                    event.deltaY > 0
                        ? oldZoom * 1.1
                        : oldZoom / 1.1;
                state.paper.view.zoom =
                    newZoom;
                $("#rangeInput").val(
                    newZoom
                );
            }
        );
}
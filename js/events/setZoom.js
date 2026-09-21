// js/events/setZoom.js

import state from "../core/state.js";

// تنظیم بزرگ‌نمایی و قرارگیری طراحی در مرکز Canvas
export function setZoom() {
    console.log("========== SET ZOOM ==========");
    console.log("mainFrame:", state.mainFrame);
    console.log("mainFrame bounds:", state.mainFrame?.bounds);
    console.log("mainSection:", state.mainSection);
    console.log("mainSection bounds:", state.mainSection?.bounds);
    console.log(
        "activeLayer bounds:",
        state.paper.project.activeLayer?.bounds
    );
    console.log(
        "view center BEFORE:",
        state.paper.view.center
    );
    const canvas = document.getElementById("myCanvas");

    if (!canvas || !state.paper) {
        return;
    }

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const actualWidth = canvas.width;
    const actualHeight = canvas.height;

    // کل طراحی روی Canvas
    const design = state.paper.project.activeLayer;

    const hasBounds =
        design &&
        design.bounds &&
        design.bounds.width > 0 &&
        design.bounds.height > 0;

    const designWidth = hasBounds
        ? design.bounds.width
        : 2000;

    const designHeight = hasBounds
        ? design.bounds.height
        : 1000;

    const usableWidth = cssWidth * 0.9;
    const usableHeight = cssHeight * 0.9;

    const scaleX = usableWidth / designWidth;
    const scaleY = usableHeight / designHeight;

    const scale = Math.min(scaleX, scaleY);

    state.paper.view.zoom = scale;

    state.paper.view.center = hasBounds
        ? design.bounds.center
        : new state.paper.Point(
            actualWidth / 2,
            actualHeight / 2
        );

    state.paper.view.update();

    // نمایش مقدار Zoom
    $("#rangeInput").val(scale);

    // Mouse Wheel Zoom
    $("#myCanvas")
        .off("mousewheel.setZoom")
        .on("mousewheel.setZoom", function (event) {

            event.preventDefault();

            const oldZoom = state.paper.view.zoom;

            const newZoom =
                event.deltaY > 0
                    ? oldZoom * 1.1
                    : oldZoom / 1.1;

            state.paper.view.zoom = newZoom;

            $("#rangeInput").val(
                state.paper.view.zoom
            );
        });
}
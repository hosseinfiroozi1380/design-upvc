// src/drawing/buildFrame.js
import state from "../core/state.js";
import {
    createGLs
} from "./createGLs.js";
import {
    createDimensionBar
} from "./createDimensionBar.js";
import {
    setZoom
} from "../events/setZoom.js";
import {
    showMessage
} from "../utils/showMessage.js";
import {
    setDefaultData
} from "../utils/setDefaultData.js";
import PaperOffset from "../utils/PaperOffset.js";
export function buildFrame(
    tmpShape,
    newFrameSize = false,
    mainFrameData = false,
    isExtension = false
) {
    let testFrameSize = state.firstFrame_width;
    if (!testFrameSize) {
        showMessage(
            "بنظر می رسد این پروفیل شامل فریم نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید."
        );
        return false;
    }
    state.frameSize = testFrameSize;
    state.frameColor =
        state.unitData.profile_color_hex;
    // MAIN SECTION
    if (!isExtension) {
        state.mainSection = new state.paper.Group();
        state.mainSection.name = "section";
    
        /*
         * شناسه ثابت برای این طراحی
         */
        state.mainSection.data.designID =
            state.currentDesignID || null;
    }
    if (newFrameSize) {
        state.frameSize =
            newFrameSize;
    }
    if (mainFrameData) {
        state.frameSize =
            mainFrameData.profile_width;
    }
    // افزونه
    if (isExtension) {
        const extensionSection = new state.paper.Group();
        extensionSection.name = "section";
        // CREATE MAIN FLAT
        state.mainFlat = PaperOffset.offset(
            tmpShape,
            -state.frameSize
        );
        state.mainFlat.fillColor = "#4fc3f724";
        state.mainFlat.name = "mainFlat";
        extensionSection.addChild(state.mainFlat);
        // CREATE FIRST FLAT
        const firstFlat = state.mainFlat.clone();
        firstFlat.fillColor = "#8acde8";
        firstFlat.name = "flat";
        setDefaultData(firstFlat, "flat");
        extensionSection.addChild(firstFlat);
        // CREATE FRAME
        state.mainFrame = tmpShape.subtract(state.mainFlat);
        if (
            state.mainFrame.children &&
            state.mainFrame.children.length >= 2
        ) {
            state.mainFrame.children[0].name = "mainFlat";
            state.mainFrame.children[1].name = "mainFlat";
        }
        state.mainFrame.strokeColor = state.strokeColor;
        state.mainFrame.fillColor = state.frameColor;
        state.mainFrame.name = "mainFrame";
        setDefaultData(
            state.mainFrame,
            "mainFrame"
        );
        // FRAME CUT LINE
        if (
            state.mainFrame.children &&
            state.mainFrame.children.length >= 2
        ) {
            $.each(
                state.mainFrame.children[0].segments,
                function (key, value) {
                    const nearestPoint =
                        state.mainFrame.children[1]
                            .getNearestPoint(value.point);
                    if (nearestPoint) {
                        const frameCutLine =
                            new state.paper.Path.Line({
                                from: value.point,
                                to: nearestPoint,
                                name: "frameCutLine"
                            });
                        state.mainFrame.addChild(
                            frameCutLine
                        );
                    }
                }
            );
        }
        extensionSection.addChild(state.mainFrame);
        state.mainFlat.remove();
        tmpShape.remove();
        // اضافه کردن Section جدید به طراحی موجود
        state.paper.project.activeLayer.addChild(
            extensionSection
        );
        createGLs();
        createDimensionBar();
        return extensionSection;
    }
    // CREATE MAIN FLAT
    state.mainFlat =
        PaperOffset.offset(
            tmpShape,
            -state.frameSize
        );
    state.mainFlat.fillColor =
        "#4fc3f724";
    state.mainFlat.name =
        "mainFlat";
    state.mainSection.addChild(
        state.mainFlat
    );
    // BOTTOM DOOR
    if (
        mainFrameData &&
        mainFrameData.bottomdoor > 0
    ) {
        let scaleY =
            (
                state.mainFlat.bounds.height +
                state.frameSize -
                mainFrameData.bottomdoor
            )
            /
            state.mainFlat.bounds.height;
        state.mainFlat.scale(
            1,
            scaleY
        );
        state.mainFlat.bounds.y =
            state.frameSize;
    }
    // CREATE FIRST FLAT
    let firstFlat =
        state.mainFlat.clone();
    firstFlat.fillColor = "#8acde8";
    firstFlat.name =
        "flat";
    setDefaultData(
        firstFlat,
        "flat"
    );
    state.mainSection.addChild(
        firstFlat
    );
    // CREATE FRAME
    state.mainFrame =
        tmpShape.subtract(
            state.mainFlat
        );
    if (
        state.mainFrame.children &&
        state.mainFrame.children.length >= 2
    ) {
        state.mainFrame.children[0].name =
            "mainFlat";
        state.mainFrame.children[1].name =
            "mainFlat";
    }
    state.mainFrame.strokeColor =
        state.strokeColor;
    state.mainFrame.fillColor =
        state.frameColor;
    state.mainFrame.name =
        "mainFrame";
    setDefaultData(
        state.mainFrame,
        "mainFrame"
    );
    if (mainFrameData) {
        state.mainFrame.data =
            mainFrameData;
    }
    // FRAME CUT LINE
    if (
        state.mainFrame.children &&
        state.mainFrame.children.length >= 2
    ) {
        $.each(
            state.mainFrame.children[0].segments,
            function (
                key,
                value
            ) {
                let nearestPoint =
                    state.mainFrame.children[1]
                        .getNearestPoint(
                            value.point
                        );
                if (nearestPoint) {
                    let fromPoint =
                        value.point;
                    let toPoint =
                        nearestPoint;
                    let frameCutLine =
                        new state.paper.Path.Line({
                            from:
                                (
                                    mainFrameData &&
                                    mainFrameData.bottomdoor > 0 &&
                                    fromPoint.y ==
                                    state.mainFrame.bounds.height
                                )
                                    ?
                                    [
                                        toPoint.x,
                                        fromPoint.y
                                    ]
                                    :
                                    fromPoint,
                            to:
                                toPoint,
                            name:
                                "frameCutLine"
                        });
                    state.mainFrame.addChild(
                        frameCutLine
                    );
                }
            }
        );
    }
    // ADD FRAME TO SECTION
    state.mainSection.addChild(
        state.mainFrame
    );

    state.mainFlat.remove();
    tmpShape.remove();
    // AFTER BUILD
    createGLs();
    createDimensionBar();
    setZoom();
    return state.mainSection;
}
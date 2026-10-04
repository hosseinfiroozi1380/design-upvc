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
function createGlassBorders(glassShape, section) {
    const blackWidth = 1.5;
    const whiteWidth = 12;
    const innerBlackWidth = 1.5;
    // گروه ثابت مرز شیشه
    const glassBorders = new state.paper.Group();
    glassBorders.name = "glassBorders";
    // مرز مشکی بیرونی
    const outerBlackInner = PaperOffset.offset(
        glassShape,
        -blackWidth
    );
    const outerBlack = glassShape.subtract(
        outerBlackInner
    );
    outerBlack.fillColor = "#222222";
    outerBlack.strokeColor = null;
    outerBlack.name = "glassOuterBlack";
    glassBorders.addChild(outerBlack);
    // مرز سفید
    const whiteInner = PaperOffset.offset(
        outerBlackInner,
        -whiteWidth
    );
    const whiteBorder = outerBlackInner.subtract(
        whiteInner
    );
    whiteBorder.fillColor = "#ffffff";
    whiteBorder.strokeColor = null;
    whiteBorder.name = "glassWhiteBorder";
    glassBorders.addChild(whiteBorder);
    // چهار نیم‌ساز 45 درجه
    const outerBounds = outerBlackInner.bounds;
    const innerBounds = whiteInner.bounds;
    const cornerGroup = new state.paper.Group();
    cornerGroup.name = "glassCornerBisectors";
    const topLeft = new state.paper.Path.Line({
        from: [
            outerBounds.left,
            outerBounds.top
        ],
        to: [
            innerBounds.left,
            innerBounds.top
        ]
    });
    const topRight = new state.paper.Path.Line({
        from: [
            outerBounds.right,
            outerBounds.top
        ],
        to: [
            innerBounds.right,
            innerBounds.top
        ]
    });
    const bottomLeft = new state.paper.Path.Line({
        from: [
            outerBounds.left,
            outerBounds.bottom
        ],
        to: [
            innerBounds.left,
            innerBounds.bottom
        ]
    });
    const bottomRight = new state.paper.Path.Line({
        from: [
            outerBounds.right,
            outerBounds.bottom
        ],
        to: [
            innerBounds.right,
            innerBounds.bottom
        ]
    });
    [
        topLeft,
        topRight,
        bottomLeft,
        bottomRight
    ].forEach(line => {
        line.strokeColor = "#222222";
        line.strokeWidth = 1.5;
        line.strokeCap = "butt";
        line.name = "glassCornerBisector";
        cornerGroup.addChild(line);
    });
    glassBorders.addChild(cornerGroup);
    // مرز مشکی داخلی
    const innerBlackInner = PaperOffset.offset(
        whiteInner,
        -innerBlackWidth
    );
    const innerBlack = whiteInner.subtract(
        innerBlackInner
    );
    innerBlack.fillColor = "#222222";
    innerBlack.strokeColor = null;
    innerBlack.name = "glassInnerBlack";
    glassBorders.addChild(innerBlack);
    // اضافه کردن گروه مرز
    section.addChild(
        glassBorders
    );
    // حذف شکل‌های کمکی
    outerBlackInner.remove();
    whiteInner.remove();
    innerBlackInner.remove();
    return glassBorders;
}
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
        createGlassBorders(firstFlat, extensionSection);
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
    createGlassBorders(firstFlat, state.mainSection);
    state.mainFlat.remove();
    tmpShape.remove();
    // AFTER BUILD
    createGLs();
    createDimensionBar();
    setZoom();
    return state.mainSection;
}
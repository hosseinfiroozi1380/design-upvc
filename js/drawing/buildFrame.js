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
    mainFrameData = false
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
    // اگر فریم اصلی قبلی وجود دارد، قبل از ساخت فریم جدید حذف شود
    if (state.mainSection && state.mainSection.parent) {
        state.mainSection.remove();
    }

    state.mainSection = new state.paper.Group();
    state.mainSection.name = "section";
    if (newFrameSize) {
        state.frameSize =
            newFrameSize;
    }
    if (mainFrameData) {
        state.frameSize =
            mainFrameData.profile_width;
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
        firstFlat.fillColor = "#9CCFE3";
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
            function(
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

















// // src/drawing/buildFrame.js
// import state from "../core/state.js";
// import {
//     createGLs
// } from "./createGLs.js";
// import {
//     createDimensionBar
// } from "./createDimensionBar.js";
// import {
//     setZoom
// } from "../events/setZoom.js";
// import {
//     showMessage
// } from "../utils/showMessage.js";
// import {
//     setDefaultData
// } from "../utils/setDefaultData.js";
// import PaperOffset from "../utils/PaperOffset.js";
// export function buildFrame(
//     tmpShape,
//     newFrameSize = false,
//     mainFrameData = false
// ) {
//     let testFrameSize = state.firstFrame_width;
//     if (!testFrameSize) {
//         showMessage(
//             "بنظر می رسد این پروفیل شامل فریم نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید."
//         );
//         return false;
//     }
//     state.frameSize = testFrameSize;
//     state.frameColor =
//         state.unitData.profile_color_hex;
//     // MAIN SECTION
//     state.mainSection =
//         new state.paper.Group();
//     state.mainSection.name =
//         "section";
//     if (newFrameSize) {
//         state.frameSize =
//             newFrameSize;
//     }
//     if (mainFrameData) {
//         state.frameSize =
//             mainFrameData.profile_width;
//     }
//     // CREATE MAIN FLAT
//     state.mainFlat =
//         PaperOffset.offset(
//             tmpShape,
//             -state.frameSize
//         );
//     state.mainFlat.fillColor =
//         "#4fc3f724";
//     state.mainFlat.name =
//         "mainFlat";
//     state.mainSection.addChild(
//         state.mainFlat
//     );
//     // BOTTOM DOOR
//     if (
//         mainFrameData &&
//         mainFrameData.bottomdoor > 0
//     ) {
//         let scaleY =
//             (
//                 state.mainFlat.bounds.height +
//                 state.frameSize -
//                 mainFrameData.bottomdoor
//             )
//             /
//             state.mainFlat.bounds.height;
//         state.mainFlat.scale(
//             1,
//             scaleY
//         );
//         state.mainFlat.bounds.y =
//             state.frameSize;
//     }
//     // CREATE FIRST FLAT
//     let firstFlat =
//         state.mainFlat.clone();
//     firstFlat.fillColor = "#8acde8";
//     firstFlat.name =
//         "flat";
//     setDefaultData(
//         firstFlat,
//         "flat"
//     );
//     state.mainSection.addChild(
//         firstFlat
//     );
//     // CREATE FRAME
//     state.mainFrame =
//         tmpShape.subtract(
//             state.mainFlat
//         );
//     if (
//         state.mainFrame.children &&
//         state.mainFrame.children.length >= 2
//     ) {
//         state.mainFrame.children[0].name =
//             "mainFlat";
//         state.mainFrame.children[1].name =
//             "mainFlat";
//     }
//     state.mainFrame.strokeColor =
//         state.strokeColor;
//     state.mainFrame.fillColor =
//         state.frameColor;
//     state.mainFrame.name =
//         "mainFrame";
//     setDefaultData(
//         state.mainFrame,
//         "mainFrame"
//     );
//     if (mainFrameData) {
//         state.mainFrame.data =
//             mainFrameData;
//     }
//         // CREATE INNER FRAME

//         const innerFrameSize = 15;

//         let innerFrameInner = PaperOffset.offset(
//             state.mainFlat,
//             -innerFrameSize
//         );
    
//         let innerFrame = state.mainFlat.subtract(
//             innerFrameInner
//         );
    
//         innerFrame.fillColor =
//             state.frameColor;
    
//         innerFrame.strokeColor =
//             state.strokeColor;
    
//         innerFrame.strokeWidth = 1;
    
//         innerFrame.name =
//             "innerFrame";
    
//         setDefaultData(
//             innerFrame,
//             "innerFrame"
//         );
    
//         state.mainSection.addChild(
//             innerFrame
//         );
    
//         innerFrameInner.remove();
    
    
//         // چهار نیم‌ساز گوشه‌ای فریم داخلی
    
//         const innerBounds =
//             innerFrame.bounds;
    
    
//         const topLeftBisector =
//             new state.paper.Path.Line({
//                 from: innerBounds.topLeft,
//                 to: innerBounds.topLeft.add(
//                     new state.paper.Point(
//                         innerFrameSize,
//                         innerFrameSize
//                     )
//                 ),
//                 strokeColor: state.strokeColor,
//                 strokeWidth: 1,
//                 name: "innerFrameBisectorTopLeft"
//             });
    
    
//         const topRightBisector =
//             new state.paper.Path.Line({
//                 from: innerBounds.topRight,
//                 to: innerBounds.topRight.add(
//                     new state.paper.Point(
//                         -innerFrameSize,
//                         innerFrameSize
//                     )
//                 ),
//                 strokeColor: state.strokeColor,
//                 strokeWidth: 1,
//                 name: "innerFrameBisectorTopRight"
//             });
    
    
//         const bottomLeftBisector =
//             new state.paper.Path.Line({
//                 from: innerBounds.bottomLeft,
//                 to: innerBounds.bottomLeft.add(
//                     new state.paper.Point(
//                         innerFrameSize,
//                         -innerFrameSize
//                     )
//                 ),
//                 strokeColor: state.strokeColor,
//                 strokeWidth: 1,
//                 name: "innerFrameBisectorBottomLeft"
//             });
    
    
//         const bottomRightBisector =
//             new state.paper.Path.Line({
//                 from: innerBounds.bottomRight,
//                 to: innerBounds.bottomRight.add(
//                     new state.paper.Point(
//                         -innerFrameSize,
//                         -innerFrameSize
//                     )
//                 ),
//                 strokeColor: state.strokeColor,
//                 strokeWidth: 1,
//                 name: "innerFrameBisectorBottomRight"
//             });
    
    
//     // گروه فریم داخلی و نیم‌سازها
// state.innerFrameGroup = new state.paper.Group();
// state.innerFrameGroup.name = "innerFrameGroup";

// state.innerFrameGroup.addChild(innerFrame);

// state.innerFrameGroup.addChildren([
//     topLeftBisector,
//     topRightBisector,
//     bottomLeftBisector,
//     bottomRightBisector
// ]);

// state.mainSection.addChild(
//     state.innerFrameGroup
// );
//     // FRAME CUT LINE
//     if (
//         state.mainFrame.children &&
//         state.mainFrame.children.length >= 2
//     ) {
//         $.each(
//             state.mainFrame.children[0].segments,
//             function (
//                 key,
//                 value
//             ) {
//                 let nearestPoint =
//                     state.mainFrame.children[1]
//                         .getNearestPoint(
//                             value.point
//                         );
//                 if (nearestPoint) {
//                     let fromPoint =
//                         value.point;
//                     let toPoint =
//                         nearestPoint;
//                     let frameCutLine =
//                         new state.paper.Path.Line({
//                             from:
//                                 (
//                                     mainFrameData &&
//                                     mainFrameData.bottomdoor > 0 &&
//                                     fromPoint.y ==
//                                     state.mainFrame.bounds.height
//                                 )
//                                     ?
//                                     [
//                                         toPoint.x,
//                                         fromPoint.y
//                                     ]
//                                     :
//                                     fromPoint,
//                             to:
//                                 toPoint,
//                             name:
//                                 "frameCutLine"
//                         });
//                     state.mainFrame.addChild(
//                         frameCutLine
//                     );
//                 }
//             }
//         );
//     }
//     // ADD FRAME TO SECTION
//     state.mainSection.addChild(
//         state.mainFrame
//     );
// // نمایش فریم داخلی و نیم‌سازها
// state.innerFrameGroup.bringToFront();
//     state.mainFlat.remove();
//     tmpShape.remove();
//     // AFTER BUILD
//     createGLs();
//     createDimensionBar();
//     setZoom();
//     return state.mainSection;
// }
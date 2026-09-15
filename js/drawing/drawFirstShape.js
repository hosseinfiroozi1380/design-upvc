// src/drawing/drawFirstShape.js
import state from "../core/state.js";
import { buildFrame } from "./buildFrame.js";
import { updateLayerDetailsMenuOptions } from "../utils/updateLayerDetailsMenuOptions.js";
import { mouseHelperSetColor } from "../events/mouseHelperSetColor.js";
import { saveDesign } from "../services/saveDesign.js";
import { showMessage } from "../utils/showMessage.js";
import { filterAutomateCreationBtns } from "../utils/filterAutomateCreationBtns.js";
import { enableSave } from "../services/enableSave.js";
import { loadLayerList } from "../services/loadLayerList.js";
export function drawFirstShape(formData, redraw = false, mainFrameData = false, section = false) {
    console.log("ENTER drawFirstShape", {
        formData,
        paper:state.paper
       });
    state.unitData.name = (
        redraw
            ? state.unitData.name
            : parseInt($('#countDesign').text()) + 1
    );
    state.unitData.location = redraw ? state.unitData.location : "";
    state.unitData.visibility = formData.visibility ?? true;
    state.unitData.locked = formData.locked ?? false;
    state.unitData.quantity = formData.quantity;
    state.unitData.pattern_id = formData.pattern_id;
    state.unitData.profile_id = formData.profile_id;
    state.unitData.profile_color = formData.profile_color;
    state.unitData.profile_color_hex =
        formData.profile_color_hex ??
        $('#profile_color option[value="' + formData.profile_color + '"]').data('hex');
    state.unitData.accessory_id = formData.accessory_id;
    state.unitData.glass_id = formData.glass_id;
    state.unitData.system =
        formData.system ??
        $('#profile_id option[value="' + formData.profile_id + '"]').data('system');
    state.unitData.type =
        formData.type ??
        $('#profile_id option[value="' + formData.profile_id + '"]').data('type');
    state.unitData.shape = formData.shape;
    state.unitData.dimension = formData.dimension;
    state.unitData.abcd = formData.abcd;
    state.defaultOverlap =
        state.unitData.system == "Al" ? 6 : 8;
    state.mullianExtend =
        state.unitData.system == "Al" ? 0 : 3;
    $('.layerName').val(state.unitData.name);
    $('.location').val(state.unitData.location);
    $('.layerQuantity').val(state.unitData.quantity);
    updateLayerDetailsMenuOptions();
    let bottomDoorHeight = 0;
    state.extra_frame_lenght =
        parseFloat(
            $('.frameInput option[value="' + state.firstFrame + '"]')
                .data('extra_frame_lenght') || 0
        );
    let frameType =
        $('.frameInput option[value="' + state.firstFrame + '"]')
            .data('type') || 0;
    if (mainFrameData) {
        state.extra_frame_lenght =
            parseFloat(
                $('.frameInput option[value="' + mainFrameData.profile + '"]')
                    .data('extra_frame_lenght') || 0
            );
        frameType =
            $('.frameInput option[value="' + mainFrameData.profile + '"]')
                .data('type') || 0;
        bottomDoorHeight = mainFrameData.bottomdoor;
    }
    if (state.extra_frame_lenght > 0) {
        mouseHelperSetColor(
            'info',
            `${state.extra_frame_lenght}x2 میلیمتر بابت بال پرواز فریم به ابعاد اضافه شد`
        );
    }
    if (
        state.extra_frame_lenght == 0 &&
        (frameType == "Window Sash" || frameType == "Door Sash")
    ) {
        state.extra_frame_lenght = 20;
    }
    let extar_frame_with_bottomDoor_count =
        (bottomDoorHeight > 0) ? 1 : 2;
    let itemType = formData.shape;
    let itemWidth =
        parseFloat(
            Number(formData.dimension[0]) +
            (Number(state.extra_frame_lenght) * 2)
        );
        let itemHeight =
        parseFloat(
            Number(formData.dimension[1]) +
            (Number(state.extra_frame_lenght) * 2)
        );
    
    // ذخیره ابعاد نهایی طراحی
    state.unitData.width = itemWidth;
    state.unitData.height = itemHeight;
    let a = formData.abcd.a;
    let b = formData.abcd.b;
    let c = formData.abcd.c;
    let d = formData.abcd.d;
    let startX = 0;
    let startY = 0;
    if (section) {
        startX = section.bounds.x;
        startY = section.bounds.y;
    }
    let tmpShape;
    if (itemType == "simple_rectangle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(startX, startY)
        );
        tmpShape.lineTo(
            new state.paper.Point(startX, startY + itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(startX + itemWidth, startY + itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(startX + itemWidth, startY)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_top") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(a, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth - b, 0)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_bottom") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(a, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth - b, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, 0)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_left") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(a, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth - b, 0)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_right") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(b, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth - a, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, 0)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_mo_left") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight - a)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight - b)
        );
        tmpShape.closed = true;
    }
    if (itemType == "Parallelogram_mo_right") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, b)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight - a)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, 0)
        );
        tmpShape.closed = true;
    }
    if (itemType == "triangle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(a, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.closed = true;
    }
    if (itemType == "polygon") {
        tmpShape = new state.paper.Path.RegularPolygon({
            center: [
                itemWidth / 2,
                itemHeight / 2
            ],
            sides: a,
            radius: itemWidth / 2
        });
        tmpShape.closed = true;
    }
    if (itemType == "circle") {
        tmpShape = new state.paper.Path.Ellipse(
            new state.paper.Point(
                itemWidth / 2,
                itemHeight / 2
            ),
            new state.paper.Size(
                itemWidth,
                itemHeight
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "half_circle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2,
                0
            ),
            new state.paper.Point(
                0,
                itemHeight
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "half_circle_reverse") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(itemWidth, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, 0)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2,
                itemHeight
            ),
            new state.paper.Point(
                itemWidth,
                0
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "quarter_circle_left") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, 0)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2,
                itemHeight / 4
            ),
            new state.paper.Point(
                0,
                itemHeight
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "quarter_circle_right") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, 0)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2,
                itemHeight / 4
            ),
            new state.paper.Point(
                0,
                0
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "round_rectangle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, a)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight - c)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                c / 2,
                itemHeight - (c / 4)
            ),
            new state.paper.Point(
                c,
                itemHeight
            )
        );
        tmpShape.lineTo(
            new state.paper.Point(
                itemWidth - d,
                itemHeight
            )
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth - (d / 2),
                itemHeight - (d / 4)
            ),
            new state.paper.Point(
                itemWidth,
                itemHeight - d
            )
        );
        tmpShape.lineTo(
            new state.paper.Point(
                itemWidth,
                b
            )
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth - (b / 2),
                b / 4
            ),
            new state.paper.Point(
                itemWidth - b,
                0
            )
        );
        tmpShape.lineTo(
            new state.paper.Point(
                a,
                0
            )
        );
        tmpShape.arcTo(
            new state.paper.Point(
                a / 2,
                a / 4
            ),
            new state.paper.Point(
                0,
                a
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "arc_rectangle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(0, a)
        );
        tmpShape.lineTo(
            new state.paper.Point(0, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, itemHeight)
        );
        tmpShape.lineTo(
            new state.paper.Point(itemWidth, b)
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2,
                0
            ),
            new state.paper.Point(
                0,
                a
            )
        );
        tmpShape.closed = true;
    }
    if (itemType == "arc_triangle") {
        tmpShape = new state.paper.Path();
        tmpShape.moveTo(
            new state.paper.Point(
                0,
                itemHeight
            )
        );
        tmpShape.lineTo(
            new state.paper.Point(
                itemWidth,
                itemHeight
            )
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 2 + itemWidth / 4,
                itemHeight / 2 - itemHeight / 4
            ),
            new state.paper.Point(
                itemWidth / 2,
                0
            )
        );
        tmpShape.arcTo(
            new state.paper.Point(
                itemWidth / 4,
                itemHeight / 2 - itemHeight / 4
            ),
            new state.paper.Point(
                0,
                itemHeight
            )
        );
        tmpShape.closed = true;
    }
    let glassColor =
        $('#glass_id option[value="' +
            state.unitData.glass_id +
            '"]').data('color');
    state.flatColor =
        new state.paper.Color(glassColor);
    state.frameColor =
        state.unitData.profile_color_hex;
   console.log("EXIT drawFirstShape",{
 children:state.paper.project.activeLayer.children.length,
 mainFrame:state.mainFrame
});
console.log("========== BEFORE BUILD FRAME ==========");
console.log("state.firstFrame:", state.firstFrame);
console.log("formData.profile_id:", formData.profile_id);
console.log(
    "frame option:",
    $('.frameInput option[value="' + state.firstFrame + '"]').length
);
console.log(
    "profile option:",
    $('.frameInput option[value="' + formData.profile_id + '"]').length
);
console.log("tmpShape:", tmpShape);
console.log("itemWidth:", itemWidth);
console.log("itemHeight:", itemHeight);
console.log("========================================");
    buildFrame(
        tmpShape,
        false,
        mainFrameData
    );
    loadLayerList();
    console.log(
        "AFTER BUILD FRAME",
        state.paper.project.activeLayer.children.length,
        state.mainFrame
       );
    $('.closeModal').trigger('click');
    if (!redraw) {
        filterAutomateCreationBtns();
    } else {
        enableSave();
    }
}
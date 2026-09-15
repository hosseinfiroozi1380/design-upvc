// src/events/initPaperToolEvents.js
import state from "../core/state.js";
import { layersLayout } from "../utils/layersLayout.js";
import { showGLs } from "../utils/showGLs.js";
import { hideGLs } from "../utils/hideGLs.js";
import { recuringSelectItem } from "../utils/recuringSelectItem.js";
import { itemDetailsBar } from "../utils/itemDetailsBar.js";
import { round2decimal } from "../utils/round2decimal.js";
import { cancelAll } from "../utils/cancelAll.js";
import {
    changeMullianPosition
} from "../items/changeMullianPosition.js";
import {
    changeWindowDoorPanelPosition
} from "../items/changeWindowDoorPanelPosition.js";
import { mouseHelperHide } from "./mouseHelperHide.js";
import {
    addNewItem
} from "../items/addNewItem.js";
import {
    rebuildAccessoryMenu
} from "../drawing/rebuildAccessoryMenu.js";
import {
    reDrawMainFrame
} from "../drawing/reDrawMainFrame.js";
import { changeMullianPositionByNumber } from "../items/changeMullianPositionByNumber.js";
import { setItemProfileName } from "../utils/setItemProfileName.js";
export function initPaperToolEvents() {
    console.log("INIT PAPER TOOL EVENTS");
    console.log({
        paper: state.paper,
        tool: state.tool
    });
    const tool = state.tool;
    tool.onMouseDown = function (event) {
        $('[data-bs-toggle="tooltip"]').tooltip('hide');
        if (state.unitData.locked) {
            showMessage('یونیت قفل است. لطفا ابتدا قفل را بردارید');
            return;
        }
        layersLayout();
        state.selectedItem = false;
        state.paper.project.deselectAll();
        state.paper.project.activeLayer.selected = false;
        if (state.waitingToAddItemFlag) {
            state.glG.sendToBack();
        }
        $('.frameConfig').hide();
        $('.doorSashConfig').hide();
        $('.windowSashConfig').hide();
        $('.panelConfig').hide();
        $('.mullianConfig').hide();
        $('.accessoryConfig').hide();
        $('.laceConfig').hide();
        $('.glazingConfig').hide();
        $('.positionConfig').hide();
        $('.glassConfig').hide();
        $('.couplingConfig').hide();
        if (event.item) {
            if (event.item.hasChildren()) {
                recuringSelectItem(event.item, event.point);
            } else {
                event.item.selected = true;
                state.selectedItem = event.item;
            }
            if (state.debug) {
                console.log(state.selectedItem);
            }
            //deletemode
            if (state.deleteMode && state.selectedItem) {
                $('.dellItem').trigger('click');
                return;
            }
            $('.layersLi').removeClass('text-danger');
            if (state.selectedItem) {
                $('.layer_' + state.selectedItem.id).addClass('text-danger');
            }
            //showgl should be after state.selectedItem
            showGLs();
            if (state.selectedItem.name == "mainFrame") {
                $('.frameConfig').show();
                $(".frameWidthInput").val(round2decimal(state.selectedItem.parent.bounds.width));
                $(".frameHeightInput").val(round2decimal(state.selectedItem.parent.bounds.height));
                $(".frameInput").val(state.selectedItem.data.profile);
                $(".cornicInput").val(state.selectedItem.data.cornic);
                $(".bottomdoorStat").val((state.selectedItem.data.bottomdoor > 0) ? 1 : 0);
                $(".bottomdoorValue").val(state.selectedItem.data.bottomdoor);
                $(".thresholdInput").val(state.selectedItem.data.threshold);
                $(".cornic_checkbox").prop("checked", false);
                let cornics = state.paper.project.activeLayer.getItem({
                    name: "cornic"
                });
                if (cornics) {
                    for (let i = 0; i < cornics.children.length; i++) {
                        $("#cornic_" + cornics.children[i].name).prop("checked", true);
                    }
                }
            } else if (state.selectedItem.name == "flat") {
                $('.glazingConfig').show();
                $('.glassConfig').show();
                $(".glassInput").val(state.selectedItem.data.glass);
                $(".glazingInput").val(state.selectedItem.data.glazing);
            } else if (state.selectedItem.name == "doorFrame") {
                rebuildAccessoryMenu(state.selectedItem.parent.name, state.selectedItem.data.accessory);
                $('.doorSashConfig').show();
                $('.accessoryConfig').show();
                $('.laceConfig').show();
                $(".doorSashInput").val(state.selectedItem.data.profile);
                $(".doorSashLock").val(state.selectedItem.data.lock);
                $(".accessoryInput").val(state.selectedItem.data.accessory);
                $(".accessoryTypeInput").val(state.selectedItem.data.accessoryType);
                $(".lockTypeInput").val(state.selectedItem.data.lockType);
                $(".laceInput").val(state.selectedItem.data.lace);
            } else if (state.selectedItem.name == "windowFrame") {
                if (event.modifiers.alt) {
                    event.preventDefault();
                    $('.toggleSashType').trigger('click');
                }
                rebuildAccessoryMenu(state.selectedItem.parent.name, state.selectedItem.data.accessory);
                $('.windowSashConfig').show();
                $('.accessoryConfig').show();
                $('.laceConfig').show();
                $(".windowSashInput").val(state.selectedItem.data.profile);
                $(".doorSashLock").val(state.selectedItem.data.lock);
                $(".accessoryInput").val(state.selectedItem.data.accessory);
                $(".accessoryTypeInput").val(state.selectedItem.data.accessoryType);
                $(".lockTypeInput").val(state.selectedItem.data.lockType);
                $(".laceInput").val(state.selectedItem.data.lace);
            } else if (state.selectedItem.name == "vCoupling" || state.selectedItem.name == "hCoupling") {
                $('.couplingConfig').show();
                $(".couplingInput").val(state.selectedItem.data.profile);
            } else if (state.selectedItem.name == "vPanel" || state.selectedItem.name == "hPanel") {
                $('.panelConfig').show();
                $('.glazingConfig').show();
                $(".panelInput").val(state.selectedItem.data.profile);
                $(".glazingInput").val(state.selectedItem.data.glazing);
            } else if (state.selectedItem.name == "vMullian" || state.selectedItem.name == "hMullian") {
                $('.mullianConfig').show();
                $('.positionConfig').show();
                if (state.selectedItem.name == "vMullian") {
                    $('.positionConfigInput').val(round2decimal(state.selectedItem.bounds.left + state.frameSize / 2));
                } else {
                    $('.positionConfigInput').val(round2decimal(state.selectedItem.bounds.top + +state.frameSize / 2));
                }
                $(".mullianInput").val(state.selectedItem.data.profile);
            } else if (["mXBarT", "mYBarT"].includes(state.selectedItem.name)) {
                let sectionID = state.selectedItem.data.section;
                let section = state.paper.project.activeLayer.getItem({
                    id: sectionID
                });
                let mXBarT, mYBarT;
                let dbG = state.paper.project.activeLayer.getItem({
                    name: "dbG"
                });
                for (let n = 0; n < dbG.children.length; n++) {
                    if (dbG.children[n].name == "mXBarT" && dbG.children[n].data.section == sectionID) {
                        mXBarT = dbG.children[n];
                    }
                    if (dbG.children[n].name == "mYBarT" && dbG.children[n].data.section == sectionID) {
                        mYBarT = dbG.children[n];
                    }
                }
                let mXBarT_Text = parseInt(mXBarT.content.match(/\d+/)[0]);
                let mYBarT_Text = parseInt(mYBarT.content.match(/\d+/)[0]);
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="mXBarT-input">عرض</label>' +
                        '<input id="mXBarT-input" class="wd-input-box" type="number" value="' + mXBarT_Text + '">' +
                        '</div>' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="mYBarT-input">ارتفاع</label>' +
                        '<input id="mYBarT-input" class="wd-input-box" type="number" value="' + mYBarT_Text + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve([
                                $('#mXBarT-input').val(),
                                $('#mYBarT-input').val()
                            ])
                        })
                    },
                    onOpen: function () {
                        $('#mXBarT-input').focus();
                        $('#mYBarT-input, #mXBarT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        reDrawMainFrame(section, result.value)
                    }
                });
            } else if (state.selectedItem.name == "vMGLT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="vMGLT-input">اندازه</label>' +
                        '<input id="vMGLT-input" class="wd-input-box" type="number" value="' + vMGLT.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#vMGLT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#vMGLT-input').focus();
                        $('#vMGLT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        state.selectedItem = previousSelectedItem;
                        changeMullianPosition(
                            new state.paper.Point(
                                Number(result.value),
                                state.selectedItem.bounds.centerY
                            )
                        );
                        hideGLs();
                    }
                });
            } else if (state.selectedItem.name == "vMGRT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="vMGRT-input">اندازه</label>' +
                        '<input id="vMGRT-input" class="wd-input-box" type="number" value="' + vMGRT.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#vMGRT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#vMGRT-input').focus();
                        $('#vMGRT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        state.selectedItem = previousSelectedItem;
                        changeMullianPosition(new state.paper.Point((mainFrame.bounds.x + mainFrame.bounds.width - result.value), state.selectedItem.bounds.centerY));
                        hideGLs();
                    }
                });
            } else if (state.selectedItem.name == "hMGTT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="hMGTT-input">اندازه</label>' +
                        '<input id="hMGTT-input" class="wd-input-box" type="number" value="' + hMGTT.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#hMGTT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#hMGTT-input').focus();
                        $('#hMGTT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        state.selectedItem = previousSelectedItem;
                        changeMullianPosition(new state.paper.Point(state.selectedItem.bounds.centerX, Number(result.value)));
                        hideGLs();
                    }
                });
            } else if (state.selectedItem.name == "hMGBT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="hMGBT-input">اندازه</label>' +
                        '<input id="hMGBT-input" class="wd-input-box" type="number" value="' + hMGBT.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#hMGBT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#hMGBT-input').focus();
                        $('#hMGBT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        state.selectedItem = previousSelectedItem;
                        changeMullianPosition(new state.paper.Point((state.selectedItem.bounds.centerX, mainFrame.bounds.y + mainFrame.bounds.height - result.value)));
                        hideGLs();
                    }
                });
            } else if (state.selectedItem.name == "xBarT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="xBarT-input">اندازه</label>' +
                        '<input id="xBarT-input" class="wd-input-box" type="number" value="' + state.selectedItem.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#xBarT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#xBarT-input').focus();
                        $('#xBarT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        changeMullianPositionByNumber({
                            from: state.selectedItem.data.position,
                            to: state.selectedItem.data.position + (result.value - state.selectedItem.content),
                            label: state.selectedItem.content,
                            mullianType: "vMullian",
                            sectionID: state.selectedItem.data.section
                        });
                    }
                });
            } else if (state.selectedItem.name == "yBarT") {
                Swal.fire({
                    confirmButtonText: "تغییر",
                    html:
                        '<div class="wd-size-fields">' +
                        '<div class="wd-size-field">' +
                        '<label class="wd-form-label" for="yBarT-input">اندازه</label>' +
                        '<input id="yBarT-input" class="wd-input-box" type="number" value="' + state.selectedItem.content + '">' +
                        '</div>' +
                        '</div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve(
                                $('#yBarT-input').val()
                            )
                        })
                    },
                    onOpen: function () {
                        $('#yBarT-input').focus();
                        $('#yBarT-input').on('keypress', function (e) {
                            if (e.which === 13) {
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        changeMullianPositionByNumber({
                            from: state.selectedItem.data.position,
                            to: state.selectedItem.data.position + (result.value - state.selectedItem.content),
                            label: state.selectedItem.content,
                            mullianType: "hMullian",
                            sectionID: state.selectedItem.data.section
                        });
                    }
                });
            }
            //show details on itemDetails
            itemDetailsBar(state.selectedItem);
            setItemProfileName();
        } else {
            state.paper.project.deselectAll();
            state.paper.project.activeLayer.selected = false;
            state.selectedItem = false;
            $('.itemDetails').html('');
        }
    }
    tool.onMouseUp = function (event) {
        $(".unitOptions").removeClass('position-fixed unitOptionsExtra');
        $(".unitOptions").css({ 'left': 'auto', 'top': 'auto' });
        if (state.changeMullianPositionFlag) {
            state.changeMullianPositionFlag = false;
            changeMullianPosition(new state.paper.Point(Math.ceil(event.point.x / state.moveStepFactor) * state.moveStepFactor, Math.ceil(event.point.y / state.moveStepFactor) * state.moveStepFactor));
            hideGLs();
        } else if (state.changeWindowDoorPanelPositionFlag) {
            state.changeWindowDoorPanelPositionFlag = false;
            changeWindowDoorPanelPosition(new state.paper.Point(Math.ceil(event.point.x / state.moveStepFactor) * state.moveStepFactor, Math.ceil(event.point.y / state.moveStepFactor) * state.moveStepFactor));
            hideGLs();
        } else if (state.waitingToAddItemFlag) {
            state.waitingToAddItemFlag = false;
            addNewItem(state.addNewItemType, state.selectedItem, new state.paper.Point(Math.ceil(event.point.x / state.moveStepFactor) * state.moveStepFactor, Math.ceil(event.point.y / state.moveStepFactor) * state.moveStepFactor))
            state.paper.project.activeLayer.selected = false;
            state.selectedItem = false;
        } else if (state.tryingToDrag) {
            state.tryingToDrag = false;
            hideGLs();
        }
        document.body.style.cursor = "default";
        mouseHelperHide();
    };
    tool.onMouseMove = function (event) {
        if (state.waitingToAddItemFlag || state.changeMullianPositionFlag || state.changeWindowDoorPanelPositionFlag) {
            showGLs(event);
        }
        $('.mousePosition').html('<span class="small ms-1">x:' + Math.round(event.point.x) + ' y:' + Math.round(event.point.y) + '</span>');
    };
    tool.onMouseDrag = function (event) {
        let dragDistance = event.downPoint.getDistance(event.point);
        if (
            state.selectedItem &&
            !state.deleteMode &&
            (
                state.selectedItem.name == "vMullian" ||
                state.selectedItem.name == "hMullian"
            )
        ) {
            state.tryingToDrag = true;
            showGLs(event);
            if (dragDistance > state.dragThreshold) {
                state.changeMullianPositionFlag = true;
                state.tryingToDrag = false;
            }
        }
        else if (
            state.selectedItem &&
            !state.deleteMode &&
            [
                "windowFrame",
                "doorFrame",
                "vPanel",
                "hPanel"
            ].includes(state.selectedItem.name)
        ) {
            state.tryingToDrag = true;
            showGLs(event);
            if (dragDistance > state.dragThreshold) {
                state.changeWindowDoorPanelPositionFlag = true;
                state.tryingToDrag = false;
            }
        }
        else {
            state.paper.view.center =
                event.downPoint
                    .subtract(event.point)
                    .add(state.paper.view.center);
        }
    };
    tool.onKeyDown = function (event) {
        let ofcAddNew = $('#ofcAddNew').css('visibility');
        if (ofcAddNew !== 'visible' && !$('input').is(':focus')) {
            if (event.key == "escape") {
                cancelAll();
            }
            if (event.modifiers.shift && event.key == "v") {
                event.preventDefault();
                $('.vMullianEualling').trigger('click');
            }
            if (event.modifiers.shift && event.key == "h") {
                event.preventDefault();
                $('.hMullianEualling').trigger('click');
            }
            if (event.modifiers.control && event.key == "s") {
                event.preventDefault();
                $('#saveProject:visible').trigger('click');
            }
            if (event.modifiers.control && event.key == "z") {
                $('.undo:visible').trigger('click');
            }
            if (event.modifiers.control && event.key == "y") {
                $('.redo:visible').trigger('click');
            }
            if (event.key == "delete") {
                $('.dellItem').trigger('click');
            }
            if (event.key == "u") {
                $(".addNewLayer:visible").trigger('click');
            }
            if (event.key == "m") {
                $("button[data-bs-target='#ofcMullian']:visible").trigger('click');
            }
            if (event.key == "w") {
                $("button[data-bs-target='#ofcWindow']:visible").trigger('click');
            }
            if (event.key == "d") {
                $("button[data-bs-target='#ofcDoor']:visible").trigger('click');
            }
            if (event.key == "s" && !event.modifiers.control) {
                $("button[data-bs-target='#ofcSlide']:visible").trigger('click');
            }
            if (event.key == "p") {
                $("button[data-bs-target='#ofcPanel']:visible").trigger('click');
            }
            if (event.key == "o") {
                $("button[data-bs-target='#ofcCoupling']:visible").trigger('click');
            }
            if (event.modifiers.shift) {
                state.keyboard.shift = true;
            }
            if (event.modifiers.control) {
                state.keyboard.ctrl = true;
            }
        }
    };
    tool.onKeyUp = function (event) {
        state.keyboard.shift = false;
        state.keyboard.ctrl = false;
    };
}
// src/events/initLayerEvents.js

import state from "../core/state.js";

import { enableSave } from "../services/enableSave.js";

import { reDrawItem } from "../drawing/reDrawItem.js";
import { rebuildAccessoryMenu } from "../drawing/rebuildAccessoryMenu.js";

import { removeLace } from "../items/removeLace.js";
import { addLace } from "../items/addLace.js";
import { removeCornic } from "../items/removeCornic.js";
import { addCornic } from "../items/addCornic.js";
import { addLockTypeText } from "../items/addLockTypeText.js";

import { itemDetailsBar } from "../utils/itemDetailsBar.js";

export function initLayerEvents() {
    console.log("INIT LAYER EVENTS START");
    // layer name
    $(document).on('input', '.layerName', function () {
        enableSave(5000, false);
    });
    // location
    $(document).on('input', '.location', function () {
        enableSave(5000, false);
    });
    // layer quantity
    $(document).on('input', '.layerQuantity', function () {
        let lq = parseInt($(this).val());
        if (!isNaN(lq) && Number.isInteger(lq)) {
            enableSave(5000, false);
        }
    });
    
    $(document).on('keydown', '.layerName, .layerQuantity, .location', function (event) {
        if (event.key === 'Enter') {
            $(this).blur();
        }
    });

    $(document).on('blur', '.layerQuantity, .layerName, .location', function () {
        if (typeof state.unitData['type'] == "undefined") { //first load and no design
            return
        }

        let layerNameVal = $('.layerName').val();
        let locationVal = $('.location').val();
        let layerQuantityVal = parseInt($('.layerQuantity').val());

        if (state.unitData.name !== layerNameVal || state.unitData.location !== locationVal || parseInt(state.unitData.quantity) !== layerQuantityVal) {
            state.unitData.name = layerNameVal;
            state.unitData.location = locationVal;
            if (!isNaN(layerQuantityVal) && Number.isInteger(layerQuantityVal)) {
                state.unitData.quantity = layerQuantityVal;
            }
            enableSave();
        }
    });
    //component Inputs on change
    $(document).on('change', '.componentsInput', function () {
        if (state.selectedItem) {

            state.selectedItem.data = state.selectedItem.data || {};
            let thisDataName = $(this).attr('data-id');

            if (['profile', 'vCoupling', 'hCoupling'].includes(thisDataName)) {
                let previousProfileWidth = state.selectedItem.data.profile_width;
                let newProfileWidth = Number(
                    $(this).find(':selected').attr('data-width')
                );
                let thisDataType = $(this).find(':selected').attr('data-type');
                state.selectedItem.data['profile_width'] = Number(newProfileWidth);
                state.selectedItem.data[thisDataName] = Number($(this).val());
                if (thisDataType == "Mullian") {
                    state.selectedItem.data['overhung'] = 0;
                }
                if (thisDataType == "Overhung") {
                    state.selectedItem.data['overhung'] = 1;
                }
                let extra_frame_lenght_new = parseFloat($('.frameInput option[value="' + state.selectedItem.data.profile + '"]').data('extra_frame_lenght') || 0);
                if (previousProfileWidth > 0 && newProfileWidth > 0 && (previousProfileWidth != newProfileWidth || extra_frame_lenght_new != state.extra_frame_lenght)) {
                    state.extra_frame_lenght = extra_frame_lenght_new;
                    reDrawItem(state.selectedItem, newProfileWidth);
                    $("#configMenuDropDown").trigger('click');
                }
            } else if (thisDataName == 'glass') {
                let glassColor = $('.glassInput option[value=' + $(this).val() + ']').data('color');
                state.selectedItem.fillColor = new state.paper.Color(glassColor);
                let glassGroup = $('.glassInput option[value=' + $(this).val() + ']').data('group');
                $('.glazingInput[data-id="glazing"] option:not([disabled])').each(function () {
                    let gWidth = Number($(this).data('width'));
                    let minRange = glassGroup * 10;
                    let maxRange = (glassGroup + 1) * 10;
                    if (gWidth >= minRange && gWidth < maxRange) {
                        state.selectedItem.data['glazing'] = Number($(this).val());
                        $('.glazingInput[data-id="glazing"]').val($(this).val());
                    }
                });
                state.selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'accessory') {
                let thisAccessoryID = $(this).val();
                rebuildAccessoryMenu(state.selectedItem.parent.name, thisAccessoryID);
                let newAccessoryTypeVal = Number($('.accessoryTypeInput[data-id="accessoryType"] option:not([disabled]):first').val());
                $('.accessoryTypeInput[data-id="accessoryType"]').val(newAccessoryTypeVal);
                state.selectedItem.data['accessoryType'] = newAccessoryTypeVal;
                state.selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'accessoryType') {
                state.selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'lockType') {
                state.selectedItem.data[thisDataName] = $(this).val();
            } else if (thisDataName == 'glazing') {
                state.selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'lace') {
                if (Number($(this).val()) == 0) {
                    removeLace(state.selectedItem);
                } else {
                    addLace(state.selectedItem, Number($(this).val()));
                }
            } else if (thisDataName == 'cornic') {
                let cornicHeight = Number($(this).val());
                if (cornicHeight == 0) {
                    removeCornic();
                } else {
                    let top = $('#cornic_top').prop('checked');
                    let right = $('#cornic_right').prop('checked');
                    let bottom = $('#cornic_bottom').prop('checked');
                    let left = $('#cornic_left').prop('checked');
                    if (!top && !right && !bottom && !left) {
                        $('#cornic_top').prop('checked', true);
                        $('#cornic_right').prop('checked', true);
                        $('#cornic_bottom').prop('checked', true);
                        $('#cornic_left').prop('checked', true);
                        top = true;
                        right = true;
                        bottom = true;
                        left = true;
                    }
                    let cornicPositions = {
                        top: top,
                        right: right,
                        bottom: left,
                        left: left,
                    }
                    addCornic(cornicPositions, cornicHeight);
                }
            }
            $('.closeModal').trigger('click');
            itemDetailsBar(state.selectedItem);
            enableSave();
        }
    });
    // cornic_checkbox Inputs on change
    $(document).on('change', '.cornic_checkbox', function () {
        let cornicHeight = Number($('.cornicInput').val());
        if (cornicHeight !== 0) {
            let cornicPositions = {
                top: $('#cornic_top').prop('checked'),
                right: $('#cornic_right').prop('checked'),
                bottom: $('#cornic_bottom').prop('checked'),
                left: $('#cornic_left').prop('checked'),
            };
            addCornic(cornicPositions, cornicHeight);
        }
    });
    //pattern Inputs on change
    $(document).on('change', '#pattern_id', function () {
        if ($(this).find('option:selected').val() == 0) {
            return;
        }

        let selectedSystem = $(this).find('option:selected').data('system');
        $('#system_' + selectedSystem).prop('checked', true);

        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });

        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();

            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });

        $('#profile_id').val($(this).find('option:selected').data('profile_id'));
        $('#profile_color').val($(this).find('option:selected').data('profile_color'));
        $('#accessory_id').val($(this).find('option:selected').data('accessory_id'));
        $('#glass_id').val($(this).find('option:selected').data('glass_id'));
        $('#profile_color').val($(this).find('option:selected').data('profile_color'));
        $('#widthSpace').val($(this).find('option:selected').data('widthspace'));
        $('#heightSpace').val($(this).find('option:selected').data('heightspace'));

    });
    $(document).on('change', ".system_stat", function () {
        let selectedSystem = $(this).val();
        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });
        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();
            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });
    });
    $(document).on('change', '.lockTypeInput', function () {
        addLockTypeText(state.selectedItem);
    });
    // system Inputs on change
    $(document).on('change', '#profile_id', function () {
        let system = $(this).data('system');
        $('#system_' + system).prop("checked", true);
    });
    console.log("INIT LAYER EVENTS END");
}
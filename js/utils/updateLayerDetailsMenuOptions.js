// src/utils/updateLayerDetailsMenuOptions.js
import state from '../core/state.js';
export function updateLayerDetailsMenuOptions() {
    if (state.unitData['type'] == "Turn") {
        $('.ofcTurn').prop('disabled', false);
        $('.ofcSlide').prop('disabled', true);
    } else {
        $('.ofcTurn').prop('disabled', true);
        $('.ofcSlide').prop('disabled', false);
    }
    $('.frameInput[data-id="profile"] option').hide();
    $('.frameInput[data-id="profile"] option').attr("disabled", true);
    $('.frameInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.frameInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.doorSashInput[data-id="profile"] option').hide();
    $('.doorSashInput[data-id="profile"] option').attr("disabled", true);
    $('.doorSashInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.doorSashInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.windowSashInput[data-id="profile"] option').hide();
    $('.windowSashInput[data-id="profile"] option').attr("disabled", true);
    $('.windowSashInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.windowSashInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.panelInput[data-id="profile"] option').hide();
    $('.panelInput[data-id="profile"] option').attr("disabled", true);
    $('.panelInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.panelInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.mullianInput[data-id="profile"] option').hide();
    $('.mullianInput[data-id="profile"] option').attr("disabled", true);
    $('.mullianInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.mullianInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.glazingInput[data-id="glazing"] option').hide();
    $('.glazingInput[data-id="glazing"] option').attr("disabled", true);
    $('.glazingInput[data-id="glazing"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.glazingInput[data-id="glazing"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.accessoryInput option').hide();
    $('.accessoryInput option').attr("disabled", true);
    $('.accessoryInput option[data-system=' + state.unitData.system + ']').show();
    $('.accessoryInput option[data-system=' + state.unitData.system + ']').attr("disabled", false);
    $('.couplingInput[data-id="profile"] option').hide();
    $('.couplingInput[data-id="profile"] option').attr("disabled", true);
    $('.couplingInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.couplingInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    $('.enterlockInput[data-id="profile"] option').hide();
    $('.enterlockInput[data-id="profile"] option').attr("disabled", true);
    $('.enterlockInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').show();
    $('.enterlockInput[data-id="profile"] option[data-profile_id=' + state.unitData.profile_id + ']').attr("disabled", false);
    state.firstGlass = Number(state.unitData.glass_id);
    state.firstGlassColor = $('.glassInput option[value=' + state.firstGlass + ']').data('color');
    state.firstGlassGroup = $('.glassInput option[value=' + state.firstGlass + ']').data('group');
    let default_frame = 0;
    if ($('#pattern_id').val() > 0) {
        default_frame = Number($('#pattern_id').find(':selected').data('default_frame'));
    }
    state.firstFrame = (default_frame > 0)
        ? default_frame
        : Number($('.frameInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstFrame_width = (default_frame > 0)
        ? Number($('.frameInput[data-id="profile"]').find('option:not([disabled])[value="' + default_frame + '"]').attr('data-width'))
        : Number($('.frameInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstDoorSash = Number($('.doorSashInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstDoorSash_width = Number($('.doorSashInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstWindowSash = Number($('.windowSashInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstWindowSash_width = Number($('.windowSashInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstAccessory = Number(state.unitData.accessory_id);
    state.firstAccessoryType = Number($('.accessoryTypeInput[data-id="accessoryType"] option:not([disabled]):first').val());
    state.firstLockType = Number($('.doorSashLock[data-id="lockType"] option:not([disabled]):first').val());
    state.firstLace = Number($('.laceInput[data-id="lace"] option:not([disabled]):first').val());
    state.firstPanel = Number($('.panelInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstPanel_width = Number($('.panelInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstMullian = Number($('.mullianInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstMullian_width = Number($('.mullianInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstOverhung = Number($('.mullianInput[data-id="profile"] option[data-type="Overhung"]:not([disabled]):first').val());
    state.firstOverhung_width = Number($('.mullianInput[data-id="profile"] option[data-type="Overhung"]:not([disabled]):first').attr('data-width'));
    state.firstGlazing = Number($('.glazingInput[data-id="glazing"] option:not([disabled]):first').val());
    $('.glazingInput[data-id="glazing"] option:not([disabled])').each(function () {
        let gWidth = Number($(this).data('width'));
        let minRange = state.firstGlassGroup * 10;
        let maxRange = (state.firstGlassGroup + 1) * 10;
        if (gWidth >= minRange && gWidth < maxRange) {
            state.firstGlazing = $(this).val();
        }
    });
    state.firstCoupling = Number($('.couplingInput[data-id="profile"] option:not([disabled]):first').val());
    state.firstCoupling_width = Number($('.couplingInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
    state.firstEnterlock = Number($('.enterlockConfig option:not([disabled]):first').val());
    state.firstEnterlock_width = Number($('.enterlockConfig option:not([disabled]):first').attr('data-width')) || 0;
    state.firstEnterlock_sash_space = Number($('.enterlockConfig option:not([disabled]):first').attr('data-sash_space')) || 0;
    state.firstCornic = Number($('.cornicInput[data-id="cornic"] option:not([disabled]):first').val());
    state.firstBottomDoor = Number($('.bottomdoorInput[data-id="bottomdoor"] option:not([disabled]):first').val());
    state.firstThreshold = Number($('.thresholdInput[data-id="threshold"] option:not([disabled]):first').val());
}
// src/utils/itemDetailsBar.js

import state from '../core/state.js';

export function itemDetailsBar(selectedItem) {

    const $details = $('.wd-unit-details');

    if (!selectedItem) {
        $details.hide();
        return;
    }

    const data = selectedItem.data || {};
    const name = selectedItem.name;

    // همه ردیف‌ها ابتدا مخفی شوند
    $details.find('.wd-form-line').hide();

    // --------------------------------
    // فریم اصلی
    // --------------------------------
    if (name === 'mainFrame') {

        $('.frameInput')
            .closest('.wd-form-line')
            .show();

        $('.glazingInput')
            .closest('.wd-form-line')
            .show();

        $('.frameInput').val(data.profile);
        $('.glazingInput').val(data.glazing);

    }

    // --------------------------------
    // فریم پنجره
    // --------------------------------
    else if (name === 'windowFrame') {

        $('.windowSashInput')
            .closest('.wd-form-line')
            .show();

        $('.accessoryInput')
            .closest('.wd-form-line')
            .show();

        $('.accessoryTypeInput')
            .closest('.wd-form-line')
            .show();

        $('.lockTypeInput')
            .closest('.wd-form-line')
            .show();

        $('.windowSashInput').val(data.profile);
        $('.accessoryInput').val(data.accessory);

        if (data.accessoryType !== undefined) {
            $('.accessoryTypeInput')
                .val(data.accessoryType);
        }

        if (data.lockType !== undefined) {
            $('.lockTypeInput')
                .val(data.lockType);
        }
    }

    // --------------------------------
    // فریم در
    // --------------------------------
    else if (name === 'doorFrame') {

        $('.doorSashInput')
            .closest('.wd-form-line')
            .show();

        $('.accessoryInput')
            .closest('.wd-form-line')
            .show();

        $('.accessoryTypeInput')
            .closest('.wd-form-line')
            .show();

        $('.lockTypeInput')
            .closest('.wd-form-line')
            .show();

        $('.doorSashInput').val(data.profile);
        $('.accessoryInput').val(data.accessory);

        if (data.accessoryType !== undefined) {
            $('.accessoryTypeInput')
                .val(data.accessoryType);
        }

        if (data.lockType !== undefined) {
            $('.lockTypeInput')
                .val(data.lockType);
        }
    }

    // --------------------------------
    // شیشه
    // --------------------------------
    else if (name === 'flat') {

        $('.glassInput')
            .closest('.wd-form-line')
            .show();

        $('.glazingInput')
            .closest('.wd-form-line')
            .show();

        $('.laceInput')
            .closest('.wd-form-line')
            .show();

        $('.glassInput').val(data.glass);
        $('.glazingInput').val(data.glazing);
        $('.laceInput').val(data.lace);
    }

    // --------------------------------
    // مولین
    // --------------------------------
    else if (
        name === 'vMullian' ||
        name === 'hMullian'
    ) {

        $('.mullianInput')
            .closest('.wd-form-line')
            .show();

        $('.mullianInput').val(data.profile);
    }

    // --------------------------------
    // پانل
    // --------------------------------
    else if (
        name === 'vPanel' ||
        name === 'hPanel'
    ) {

        $('.panelInput')
            .closest('.wd-form-line')
            .show();

        $('.panelInput').val(data.profile);
    }

    // --------------------------------
    // اتصال
    // --------------------------------
    else if (
        name === 'vCoupling' ||
        name === 'hCoupling'
    ) {

        $('.couplingInput')
            .closest('.wd-form-line')
            .show();

        $('.couplingInput').val(data.profile);
    }

    // آیتم انتخاب‌شده ذخیره شود
    state.selectedItem = selectedItem;

    // نمایش فرم
    $details.show();
}
// src/services/loadLayerList.js

import state from '../core/state.js';
import { setItemProfileName } from '../utils/setItemProfileName.js';
import { createTempLayerCard } from '../utils/createTempLayerCard.js';

export function loadLayerList() {
    if (state.firstLayerLoad) {
        $('.starSpantTitle').html(
            '<div class="d-flex flex-column align-items-center">' +
            '<div class="spinner-border mb-3" role="status"></div>' +
            '<span>دریافت طراحی ها...</span></div>'
        );
    }

    $('.mousePosition').html(
        state.unitData?.name || ''
    );

    $('.deleteMultiLayer').hide();
    $('.addNewLayer').show();

    // موقتاً به جای دریافت لیست از لاراول
    // کارت طراحی را با JavaScript می‌سازیم
    createTempLayerCard();

    state.firstLayerLoad = false;

    setItemProfileName();
}
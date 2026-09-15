// src/events/mouseHelperSetColor.js
import state from "../core/state.js";

export function mouseHelperSetColor(color = "success", text = "") {
    if (state.ctrlKeyPressed) {
        text += `<span class="badge bg-primary ms-1">کپی آیتم</span>`;
    }
    if (state.shiftKeyPressed) {
        text += `<span class="badge bg-info ms-1">دقت در جابجایی</span>`;
    }
    $('.mouseHelper')
        .removeClass([
            'text-success',
            'text-danger',
            'text-warning',
            'text-info'
        ]);
    $('.mouseHelper')
        .addClass('text-' + color);
    $('.mouseHelper').html(text);
    $('.mouseHelper').show();
    $('.mouseHelperBg')
        .removeClass([
            'mouseHelper-success',
            'mouseHelper-danger',
            'mouseHelper-warning',
            'mouseHelper-info'
        ]);
    $('.mouseHelperBg')
        .addClass('mouseHelper-' + color);
    $('.mouseHelperBg').show();
}
// src/utils/checkDesignCheckbox.js
export function checkDesignCheckbox() {
    let checked = $('.designCheckbox:checked').map(function () {
        return this.value;
    }).get();
    if (checked.length > 0) {
        $('.addNewLayer').hide();
        $('.deleteMultiLayer').show('fast');
    } else {
        $('.deleteMultiLayer').hide();
        $('.addNewLayer').show('fast');
    }
}
import state from "../core/state.js";
// تنظیم بزرگ‌نمایی و قرارگیری طراحی در مرکز Canvas
export function setZoom() {
    const canvas = document.getElementById("myCanvas");
    if (!canvas || !state.paper) {
        return;
    }
    const design = state.mainFrame;
    if (
        !design ||
        !design.bounds ||
        design.bounds.width <= 0 ||
        design.bounds.height <= 0
    ) {
        return;
    }
    /*
     * Zoom ثابت
     *
     * اندازه واقعی طراحی مهم نیست.
     * چه 500 باشد، چه 1000، چه 2000، چه 3000،
     * همه با یک مقیاس نمایش داده می‌شوند.
     */
    const zoom = 0.30;
    state.paper.view.zoom = zoom;
    /*
     * طراحی همیشه دقیقاً وسط Canvas
     */
    state.paper.view.center = design.bounds.center;
    state.paper.view.update();
    /*
     * نمایش مقدار Zoom
     */
    $("#rangeInput").val(zoom);
    /*
     * Mouse Wheel Zoom
     */
    $("#myCanvas")
        .off("mousewheel.setZoom")
        .on("mousewheel.setZoom", function (event) {
            event.preventDefault();
            const oldZoom = state.paper.view.zoom;
            const newZoom =
                event.deltaY > 0
                    ? oldZoom * 1.1
                    : oldZoom / 1.1;
            state.paper.view.zoom = newZoom;
            $("#rangeInput").val(
                state.paper.view.zoom
            );
        });
}
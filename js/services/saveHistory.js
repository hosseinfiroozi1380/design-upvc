import state from "../core/state.js";
export function saveHistory() {
    if (!state.paper?.project) {
        return;
    }
    const currentState = state.paper.project.exportJSON();
    // پیدا کردن طراحی فعال
    const design = state.tempDesigns?.find(
        item =>
            String(item.id) ===
            String(state.currentDesignID)
    );
    // تاریخچه مخصوص طراحی فعال
    let history = design
        ? design.history
        : state.history;
    let historyIndex = design
        ? design.history_index
        : state.history_index;
    if (!Array.isArray(history)) {
        history = [];
    }
    // ایجاد اولین وضعیت تاریخچه
    if (history.length === 0) {
        history = [currentState];
        historyIndex = 0;
    } else {
        if (
            !Number.isInteger(historyIndex) ||
            historyIndex < 0 ||
            historyIndex >= history.length
        ) {
            historyIndex = history.length - 1;
        }
        // وضعیت فعلی قبلاً ذخیره شده است
        if (history[historyIndex] === currentState) {
            state.history = history;
            state.history_index = historyIndex;
            if (design) {
                design.history = [...history];
                design.history_index = historyIndex;
            }
            $(".undo").prop("disabled", historyIndex <= 0);
            $(".redo").prop(
                "disabled",
                historyIndex >= history.length - 1
            );
            return;
        }
        // حذف وضعیت‌های بعدی پس از Undo
        history = history.slice(0, historyIndex + 1);
        history.push(currentState);
        // محدودیت ۱۵ وضعیت
        if (history.length > 15) {
            history.shift();
        }
        historyIndex = history.length - 1;
    }
    // به‌روزرسانی تاریخچه فعال
    state.history = history;
    state.history_index = historyIndex;
    // ذخیره مستقل تاریخچه در طراحی
    if (design) {
        design.history = [...history];
        design.history_index = historyIndex;
    }
    $(".undo").prop("disabled", historyIndex <= 0);
    $(".redo").prop(
        "disabled",
        historyIndex >= history.length - 1
    );
}
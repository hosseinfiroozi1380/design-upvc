//

export function initHistory() {
 if (window.history && window.history.pushState) {
  window.history.pushState("nohb", null, "");
  $(window).on("popstate", function () {
   if ($('.offcanvas').hasClass('show')) {
    window.history.pushState("nohb", null, "");
    $('.offcanvas').offcanvas('hide');
    return;
   }
  });
 }
}
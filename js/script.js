// js/script.js
import state from "./core/state.js";
const wdRightPanel =
  document.getElementById("wdRightPanel");
const wdLeftPanel =
  document.getElementById("wdLeftPanel");
const wdOpenRightMenu =
  document.getElementById("wdOpenRightMenu");
const wdOpenLeftMenu =
  document.getElementById("wdOpenLeftMenu");
function wdCloseMobileMenus() {
  wdRightPanel.classList.remove(
    "wd-mobile-open"
  );
  wdLeftPanel.classList.remove(
    "wd-mobile-open"
  );
}
function wdShowRightMenu() {
  if (
    wdRightPanel.classList.contains(
      "wd-mobile-open"
    )
  ) {
    wdCloseMobileMenus();
    return;
  }
  wdLeftPanel.classList.remove(
    "wd-mobile-open"
  );
  wdRightPanel.classList.add(
    "wd-mobile-open"
  );
}
function wdShowLeftMenu() {
  if (
    wdLeftPanel.classList.contains(
      "wd-mobile-open"
    )
  ) {
    wdCloseMobileMenus();
    return;
  }
  wdRightPanel.classList.remove(
    "wd-mobile-open"
  );
  wdLeftPanel.classList.add(
    "wd-mobile-open"
  );
}
wdOpenRightMenu.addEventListener(
  "click",
  wdShowRightMenu
);
wdOpenLeftMenu.addEventListener(
  "click",
  wdShowLeftMenu
);
document.addEventListener(
  "click",
  (event) => {
    const clickedInsideRightPanel =
      wdRightPanel.contains(event.target);
    const clickedInsideLeftPanel =
      wdLeftPanel.contains(event.target);
    const clickedRightButton =
      wdOpenRightMenu.contains(event.target);
    const clickedLeftButton =
      wdOpenLeftMenu.contains(event.target);
    if (
      !clickedInsideRightPanel &&
      !clickedInsideLeftPanel &&
      !clickedRightButton &&
      !clickedLeftButton
    ) {
      wdCloseMobileMenus();
    }
  }
);
window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 768) {
      wdCloseMobileMenus();
    }
  }
);
const profileOptions =
  document.querySelectorAll(
    ".wd-profile-option"
  );
profileOptions.forEach(option => {
  option.addEventListener(
    "click",
    () => {
      profileOptions.forEach(item => {
        item.classList.remove(
          "is-active"
        );
      });
      option.classList.add(
        "is-active"
      );
    }
  );
});
var projectID = 1334;
var saveProjectRoute = "#";
var designListRoute = "";
var loadDesignRoute = "";
var destroyDesignRoute = "";
var savedImport = null;
var firstLoad = true;
state.frame_glass_space = 10;
state.window_glass_space = 10;
state.door_glass_space = 10;
function adjustHeight() {
  var screenHeight = $(window).height();
  var screenWidth = $(window).width();
  var headerHeight = $('header').outerHeight(true);
  var footerHeight = $('footer').outerHeight(true);
  var rightDiv = $('.rightDiv').outerHeight(true);
  var availableHeight;
  var isLandscape = $(window).width() >= 768;
  if (isLandscape) {
    availableHeight = screenHeight - headerHeight - footerHeight;
    $('.rightDiv, .leftDiv').addClass('col-sm-3');
    $('.rightDiv, .leftDiv').removeClass('col-12');
    $('.mobileBtns').addClass('d-none');
    $('#rightCanvas, #leftCanvas').removeClass('offcanvas offcanvas-start offcanvas-end');
    $('.toolsBtns').removeAttr('data-bs-dismiss');
    $('.closeOffCanvas').addClass('d-none');
    $('#layerlist').css('max-height', '28rem');
    $('.toolsDiv').css('max-height', '12rem');
  } else {
    availableHeight = screenHeight - headerHeight - footerHeight - rightDiv;
    $('.rightDiv, .leftDiv').addClass('col-12');
    $('.rightDiv, .leftDiv').removeClass('col-sm-3');
    $('.mobileBtns').removeClass('d-none');
    $('#rightCanvas').addClass('offcanvas offcanvas-start');
    $('#leftCanvas').addClass('offcanvas offcanvas-end');
    $('.toolsBtns').attr('data-bs-dismiss', 'offcanvas');
    $('.closeOffCanvas').removeClass('d-none');
    $('#layerlist').css('max-height', 'inherit');
    $('.toolsDiv').css('max-height', 'inherit');
  }
  $('.designCardParent').css('height', Math.max(100, availableHeight) + 'px');
  $('.leftDiv').css('height', Math.max(100, availableHeight) + 'px');
}
adjustHeight();
$(window).resize(adjustHeight);
const profileColor = document.getElementById('profile_color');
const profileColorPreview = document.getElementById('profile_color_preview');
function updateProfileColorPreview() {
  const selectedOption = profileColor.options[profileColor.selectedIndex];
  const color = selectedOption.dataset.hex || '#ffffff';
  profileColorPreview.style.backgroundColor = color;
}
profileColor.addEventListener('change', updateProfileColorPreview);
updateProfileColorPreview();
const glassSelect = document.getElementById('glass_id');
const glassColorPreview = document.getElementById('glass_color_preview');
function updateGlassColorPreview() {
  const selectedOption = glassSelect.options[glassSelect.selectedIndex];
  const color = selectedOption.dataset.color || '#ffffff';
  glassColorPreview.style.backgroundColor = color;
}
glassSelect.addEventListener('change', updateGlassColorPreview);
updateGlassColorPreview();
document.addEventListener("pointerdown", function (event) {
  const target = event.target;
  const clickedInsideRightPanel = wdRightPanel.contains(target);
  const clickedInsideLeftPanel = wdLeftPanel.contains(target);
  const clickedRightButton = wdOpenRightMenu.contains(target);
  const clickedLeftButton = wdOpenLeftMenu.contains(target);
  if (
    !clickedInsideRightPanel &&
    !clickedInsideLeftPanel &&
    !clickedRightButton &&
    !clickedLeftButton
  ) {
    wdCloseMobileMenus();
  }
});
document.getElementById("wdRightClose").addEventListener("click", function () {
  wdRightPanel.classList.remove("wd-mobile-open");
});
document.getElementById("wdLeftClose").addEventListener("click", function () {
  wdLeftPanel.classList.remove("wd-mobile-open");
});
document.addEventListener('DOMContentLoaded', function () {
  const categoryButtons = document.querySelectorAll(
    '.wd-mobile-category-bar button'
  );
  const submenuBar = document.querySelector(
    '.wd-mobile-submenu-bar'
  );
  const submenuItems = document.querySelectorAll(
    '.wd-mobile-submenu-items'
  );
  function showCategory(category) {
    categoryButtons.forEach(function (button) {
      if (
        button.dataset.category === category
      ) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    submenuItems.forEach(function (submenu) {
      submenu.classList.remove('active');
    });
    const selectedSubmenu =
      document.querySelector(
        '.wd-mobile-submenu-items[data-submenu="' +
        category +
        '"]'
      );
    if (selectedSubmenu) {
      selectedSubmenu.classList.add('active');
      submenuBar.classList.add('show');
    }
  }
  categoryButtons.forEach(function (button) {
    button.addEventListener(
      'click',
      function () {
        const category =
          this.dataset.category;
        showCategory(category);
      }
    );
  });
  const submenuButtons =
    document.querySelectorAll(
      '.wd-mobile-submenu-item'
    );
  submenuButtons.forEach(function (button) {
    let startX = 0;
    let startY = 0;
    let isMoving = false;
    button.addEventListener(
      'touchstart',
      function (event) {
        const touch =
          event.touches[0];
        startX =
          touch.clientX;
        startY =
          touch.clientY;
        isMoving = false;
      },
      {
        passive: true
      }
    );
    button.addEventListener(
      'touchmove',
      function (event) {
        const touch =
          event.touches[0];
        const moveX =
          Math.abs(
            touch.clientX - startX
          );
        const moveY =
          Math.abs(
            touch.clientY - startY
          );
        if (
          moveX > 10 &&
          moveX > moveY
        ) {
          isMoving = true;
        }
      },
      {
        passive: true
      }
    );
    button.addEventListener(
      'click',
      function (event) {
        if (isMoving) {
          event.preventDefault();
          event.stopPropagation();
          isMoving = false;
          return;
        }
      }
    );
  });
  if (categoryButtons.length > 0) {
    showCategory(
      categoryButtons[0].dataset.category
    );
  }
});
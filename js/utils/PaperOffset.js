// src/utils/PaperOffset.js

const PaperOffset = window.PaperOffset;

if (!PaperOffset) {
 throw new Error(
  "PaperOffset library is not loaded. Check script order."
 );
}

export default PaperOffset;
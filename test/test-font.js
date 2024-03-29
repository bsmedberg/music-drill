var svg = document.getElementById("staff");
var g = document.getElementById("sg");
var pt = svg.createSVGPoint();
var note = document.getElementById("note");

var gCurrent = null;
var gDone = false;

var kNotes = {
  0: "c",
  1: "d",
  2: "e",
  3: "f",
  4: "g",
  5: "a",
  6: "b"
};

function updateView() {
  if (gCurrent == null) {
    document.getElementById("ledgerb1").classList.add("hidden");
    document.getElementById("ledgerb2").classList.add("hidden");
    document.getElementById("ledgert1").classList.add("hidden");
    document.getElementById("ledgert2").classList.add("hidden");
    note.classList.add("hidden");
    return;
  }

  note.y.baseVal.value = (8 - gCurrent) * 125;
  note.classList.remove("hidden");
  document.getElementById("ledgerb1").classList.toggle("hidden", gCurrent > -2);
  document.getElementById("ledgerb2").classList.toggle("hidden", gCurrent > -4);
  document.getElementById("ledgert1").classList.toggle("hidden", gCurrent < 10);
  document.getElementById("ledgert2").classList.toggle("hidden", gCurrent < 12);
}

function eventHandler(e) {
  if (gDone) {
    return;
  }

  if (e.touches !== undefined && e.touches > 1) {
    gCurrent = null;
    updateView();
    return;
  }

  switch (e.type) {
    case "mouseleave":
    case "touchleave":
    case "touchcancel":
      if (gCurrent != null) {
        gCurrent = null;
        updateView();
      }
      return;
    case "mousemove":
    case "touchmove":
      if (gCurrent == null) {
        return;
      }
      break;
    case "mousedown":
    case "touchstart":
      note.classList.remove("red");
      break;
    case "mouseup":
    case "touchend":
      break;
    default:
      throw Error("Unexpected event");
  }

  if (e instanceof MouseEvent) {
    pt.x = e.clientX;
    pt.y = e.clientY;
  } else {
    pt.x = e.changedTouches[0].clientX;
    pt.y = e.changedTouches[0].clientY;
  }

  var staffpt = pt.matrixTransform(g.getScreenCTM().inverse());
  var staffpos = 8 - Math.round(staffpt.y / 125);

  if (staffpt.x < 500) {
    gCurrent = null;
    updateView();
    return;
  }

  if (staffpos < -4 || staffpos > 12) {
    gCurrent = null;
    updateView();
    return;
  }
  gCurrent = staffpos;
  updateView();

  if (e.type == "mouseup" || e.type == "touchend") {
    var r = document.getElementById("result");
    if (gCurrent == 2) {
      note.classList.add("green");
      gDone = true;
      r.textContent = "Good job!";
      r.classList.remove("failure");
      r.classList.add("success");
    }
    else {
      var actual = kNotes[(gCurrent + 9) % 7];
      gCurrent = null;
      r.textContent = "You clicked '" + actual + "', try again!";
      r.classList.add("failure");
    }
  }
}
svg.addEventListener("mousedown", eventHandler, false);
svg.addEventListener("mouseup", eventHandler, false);
svg.addEventListener("mouseleave", eventHandler, false);
svg.addEventListener("mousemove", eventHandler, false);
svg.addEventListener("touchstart", eventHandler, false);
svg.addEventListener("touchend", eventHandler, false);
svg.addEventListener("touchcancel", eventHandler, false);
svg.addEventListener("touchleave", eventHandler, false);
svg.addEventListener("touchmove", eventHandler, false);

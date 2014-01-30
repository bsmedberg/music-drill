var gStartTime;
var gCount;
var gMissed;
var gInterval;
var gNote = null;
var gTestCount = 2;
var gDone = null;

var g = document.getElementById.bind(document);

var kNoteElement = g("note");

function zeropad(n, len) {
  var s = n.toString();
  if (s.length >= len) {
    return s;
  }
  return Array(len - s.length + 1).join("0") + s;
}

function secsToString(secs) {
  var mins = Math.floor(secs / 60);
  var sec = secs % 60;
  var t = mins + ":" + zeropad(sec.toFixed(1), 4);
  return t;
}

function updateTimer()
{
  var secs = (Date.now() - gStartTime) / 1000;
  g("time").textContent = secsToString(secs);
}

function noteStart() {
  gNote = Math.floor(Math.random() * 17) - 4;
  kNoteElement.y.baseVal.value = (8 - gNote) * 125;
  g("ledgerb1").classList.toggle("hidden", gNote > -2);
  g("ledgerb2").classList.toggle("hidden", gNote > -4);
  g("ledgert1").classList.toggle("hidden", gNote < 10);
  g("ledgert2").classList.toggle("hidden", gNote < 12);
}

function go() {
  gStartTime = Date.now();
  gCount = 0;
  gMissed = 0;
  gInterval = setInterval(updateTimer, 50);
  noteStart();
  g("goContainer").classList.add("hidden");
  kNoteElement.classList.remove("hidden");
}

var kMapping = {
  "C": 0,
  "D": 1,
  "E": 2,
  "F": 3,
  "G": 4,
  "A": 5,
  "B": 6
};

function updateCounts() {
  g("completed").textContent = gCount;
  g("missed").textContent = gMissed;
}

function buttonListener(e)
{
  if (gNote == null) {
    return;
  }
  if (gDone) {
    return;
  }
  var button = e.currentTarget;
  var chosen = kMapping[button.value];
  var actual = (gNote + 9) % 7;
  if (chosen == actual) {
    flash("ok");
    gCount++;
    if (gCount == gTestCount) {
      gDone = (Date.now() - gStartTime) / 1000;
      clearInterval(gInterval);
      showDone();
    } else {
      noteStart();
    }
  }
  else {
    gMissed++;
    flash("fail");
  }
  updateCounts();
}

function showDone()
{
  g("resultCount").textContent = gCount;
  g("resultTime").textContent = secsToString(gDone);
  if (gMissed) {
    var e = g("resultErrors");
    e.textContent = "Errors: " + gMissed + ".";
    e.classList.remove("hidden");
  }
  g("rate").textContent = (gDone / gCount).toFixed(1);
  g("resultContainer").classList.remove("hidden");
}

function clearFlash() {
  g("result").classList.remove("ok");
  g("result").classList.remove("fail");
}

function flash(cls) {
  clearTimeout(clearFlash);
  g("result").classList.add(cls);
  setTimeout(clearFlash, 500);
}

g("goLabel").addEventListener("click", go, false);
for (var button of document.getElementsByClassName("resultButton")) {
  button.addEventListener("click", buttonListener, false);
}
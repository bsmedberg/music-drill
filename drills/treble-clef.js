var gDrill;
var gNote = null;

var kTestCount = 20;

var kNoteElement = g("note");

function noteStart() {
  gNote = randomInteger(-4, 13);
  kNoteElement.y.baseVal.value = (8 - gNote) * 125;
  g("ledgerb1").classList.toggle("hidden", gNote > -2);
  g("ledgerb2").classList.toggle("hidden", gNote > -4);
  g("ledgert1").classList.toggle("hidden", gNote < 10);
  g("ledgert2").classList.toggle("hidden", gNote < 12);
}

function go() {
  gDrill = new Drill({total: kTestCount});
  gDrill.start();

  noteStart();
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

function buttonListener(e)
{
  if (gNote == null) {
    return;
  }
  if (gDrill.done()) {
    return;
  }
  var button = e.currentTarget;
  var chosen = kMapping[button.value];
  var actual = (gNote + 9) % 7;
  if (chosen == actual) {
    gDrill.pass();
    if (!gDrill.done()) {
      noteStart();
    }
  }
  else {
    gDrill.fail();
  }
}

g("goLabel").addEventListener("click", go, false);
for (var button of document.getElementsByClassName("noteButton")) {
  button.addEventListener("click", buttonListener, false);
}
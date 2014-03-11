var gDrill;
var gKeyElement;
var gNote = null;
var gKeyboard;

var kTestCount = 20;

function keyStart() {
  var note;
  while ((note = randomInteger(0, 7)) == gNote) { }
  gNote = note;
  var selector = format("[data-note=\"%s\"]", gNote);
  gKeyElement = g("main-keyboard").querySelector(selector);
  gKeyElement.classList.add("highlight");
}

function go() {
  gDrill = new Drill({total: kTestCount});
  gDrill.start();

  keyStart();
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

function buttonListener(e) {
  if (gNote == null) {
    return;
  }
  if (gDrill.done()) {
    return;
  }
  var button = e.currentTarget;
  var chosen = kMapping[button.value];
  if (chosen == gNote) {
    gDrill.pass();
    gKeyElement.classList.remove("highlight");
    if (!gDrill.done()) {
      keyStart();
    }
  } else {
    gDrill.fail();
  }
}

g("goLabel").addEventListener("click", go, false);
for (var button of document.getElementsByClassName("noteButton")) {
  button.addEventListener("click", buttonListener, false);
}
gKeyboard = new SVGKeyboard({start: new Note({octave: 4, note: 0, mod: Note.NATURAL}),
                             end: new Note({octave: 4, note: 6, mod: Note.NATURAL}),
                             id: "main-keyboard"});
gKeyboard.insert(g("keyboard"), 1.5, 0.25);
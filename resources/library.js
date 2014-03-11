var g = document.getElementById.bind(document);
var SVGNS = "http://www.w3.org/2000/svg";

function createSVGElement(name) {
  return document.createElementNS(SVGNS, name);
}

/**
 * Return a random integer between low inclusive and high exclusive
 */
function randomInteger(low, high) {
  if (low % 1) {
    throw Error(format("randomInteger low expected integer, got %s", low));
  }
  if (high % 1) {
    throw Error(format("randomInteger high expected integer, got %s", high));
  }
  var range = high - low;
  return Math.floor(Math.random() * range) + low;
}


/* SVG Elements don't support .dataset so we emulate it */

Element.prototype.setData = function(name, value) {
  this.setAttribute("data-" + name, value);
};
Element.prototype.getData = function(name) {
  return this.getAttribute("data-" + name);
};

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

function isInteger(s) {
  return /\d+/.test(s);
}

/**
 * oval must be either undefined or nval. returns nval 
 */
function check(oval, nval) {
  if (oval !== undefined) {
    if (oval != nval) {
      throw Error("Values don't match");
    }
  }
  return nval;
}

/**
 * Format a string using pythonic %s %(name)s notation. For now only supports
 * %s for toString. Number formatting later if necessary!
 */
function format(s) {
  var positional = undefined;
  if (arguments.length > 2) {
    positional = true;
  }
  var args = Array.apply(null, arguments).slice(1);
  var position = 0;

  var re = /%(\(([\w\$]+)\))?([^])?/g;
  function replacer(all, p, varname, formatchar) {
    var val;
    switch (formatchar) {
      case "%":
        return "%";
      case "s":
        if (varname == "") {
          positional = check(positional, true);
          if (args.length <= position) {
            throw Error("Not enough format arguments");
          }
          val = args[position];
          position++;
          return String(val);
        }
        if (isInteger(varname)) {
          varname = Number(varname);
          positional = check(positional, true);
          if (args.length <= varname) {
            throw Error("Not enough arguments");
          }
          return String(args[varname]);
        } 
        positional = check(positional, false);
        if (args.length != 1) {
          throw Error("Named arguments require a single object.");
        }
        return String(args[0][varname]);
      default:
        throw Error("Unexpected format char: " + formatchar);
    }
  }
  return s.replace(re, replacer);
}

function validateRange(v, min, max) {
  if (min !== undefined && !(v >= min)) {
    throw Error(format("Value too small: %s must be at least %s", v, min));
  }
  if (max !== undefined && !(v <= max)) {
    throw Error(format("Value too large: %s must be no more than %s", v, max));
  }
  return v;
}

/**
 * Note positions start at C0 and are counted by name (C-B). Modifiers are
 * Note.NATURAL Note.FLAT and Note.SHARP.
 * 
 * Pitch positions are half steps starting at C0.
 */

/**
 * o can have any of the following combinations:
 * pos: mod:
 * octave: note: mod:
 * pos: pitch:
 */
function Note(o) {
  if (!(this instanceof Note)) {
    throw Error("Use new Note()");
  }
  var pos = o.pos;
  if (pos === undefined) {
    var octave = validateRange(o.octave, 0, 8);
    var note = validateRange(o.note, 0, 7);
    pos = octave * 7 + note;
  }
  this._pos = validateRange(pos, 0, 56); // C8
  if (o.mod !== undefined) {
    this._mod = validateRange(o.mod, Note.FLAT, Note.SHARP);
  }
  else {
    // Figure the mod based on the pitch
    var pitch = validateRange(o.pitch, 0, 96); // C8
    var naturalPitch = new Note({pos: this._pos, mod: Note.NATURAL}).pitch();
    this._mod = validateRante(pitch - naturalPitch, Note.FLAT, Note.SHARP);
  }
}
Note.NATURAL = 0;
Note.FLAT = -1;
Note.SHARP = 1;
Note.prototype._modifierNames = {};
Note.prototype._modifierNames[Note.NATURAL] = ["", "\u266E", "natural"];
Note.prototype._modifierNames[Note.FLAT] = ["\u266D", "\u266D", "flat"];
Note.prototype._modifierNames[Note.SHARP] = ["\u266F", "\u266F", "sharp"];
Note.prototype._scaleNames = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'A',
  'B'
];
Note.prototype._pitchOffsets = [
  0,
  2,
  4,
  5,
  7,
  9,
  11
];
Note.prototype.pos = function() {
  return this._pos;
};
Note.prototype.octave = function() {
  return Math.floor(this._pos / 7);
};
Note.prototype.note = function() {
  return this._pos % 7;
}
Note.prototype.toString = function() {
  var name = this._scaleNames[this.note()];
  var modifier = this._modifierNames[this._mod][0];
  return name + modifier + this.octave();
};
Note.prototype.pitch = function() {
  return this.octave() * 12 + this._pitchOffsets[this.note()] + this._mod;
};
Note.prototype.frequency = function() {
  // A4 = 440hz
  return 440 * Math.pow(2, (57 - this.pitch()) / -12);
};

function SVGKeyboard(o)
{
  var octaveWidth = 6.5;

  var start = o.start;
  if (start.note() != 0) {
    throw Error("Keyboards must currently start on C");
  }
  var end = o.end;
  if (end.note() != 6) {
    throw Error("Keyboards must currently end on B");
  }

  var octaves = end.octave() - start.octave() + 1;

  this.element_ = createSVGElement("svg");
  this.element_.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, octaveWidth * octaves + 0.0625);
  this.element_.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 5.125);
  this.element_.setAttribute("viewBox", format("0 0 %s %s", octaveWidth * octaves + 0.0625,
                                               5.125));

  var background = createSVGElement("rect");
  background.classList.add("keyboard");
  background.classList.add("background");
  background.x.baseVal.value = 0;
  background.y.baseVal.value = 0;
  background.height.baseVal.value = 5.125;
  background.width.baseVal.value = octaveWidth * octaves + 0.0625;
  this.element_.appendChild(background);

  for (var octave = start.octave(); octave <= end.octave(); ++octave) {
    // clone each octave into place
    var el = g("keyboard-octave").cloneNode(true);
    el.removeAttribute("id");
    el.x.baseVal.value = 5.5 * (octave - start.octave()) + 0.0625;
    el.y.baseVal.value = 0.0625;
    for (var noteel of el.querySelectorAll("[data-key]")) {
      noteel.setData("octave", octave);
    }
    this.element_.appendChild(el);
  }
  if (o.id) {
    this.element_.setAttribute("id", o.id);
  }
}
SVGKeyboard.prototype.insert = function(parent, x, y) {
  this.element_.x.baseVal.value = x;
  this.element_.y.baseVal.value = y;
  parent.appendChild(this.element_);
}
SVGKeyboard.prototype.onNotePress = function(fn) {
  
}
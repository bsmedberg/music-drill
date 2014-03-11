var TestRunner = {
  passes: 0,
  fails: 0,
};
TestRunner.setupResults = function() {
  var r = document.getElementById("results");
  r.innerHTML = '<p>Pass/Fail: <span id="pass">0</span>/<span id="fail">0</span> <span id="finalResults"></span>'
    + '<p><pre id="rlog"></pre>';
};
TestRunner.pass = function() {
  TestRunner.passes++;
  document.getElementById("pass").textContent = TestRunner.passes;
};
TestRunner.fail = function() {
  TestRunner.fails++;
  document.getElementById("fail").textContent = TestRunner.fails;
};
TestRunner.log = function(s) {
  if (window.console !== undefined) {
    console.log(s);
  }
  document.getElementById("rlog").textContent += s + "\n";
};
TestRunner.deepEquals = function(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
};
TestRunner.done = function() {
  var r;
  if (TestRunner.fails) {
    var s = document.getElementById("fail").style;
    s.color = "red";
    s["font-weight"] = "bold";
    r = "Done. FAIL";
  }
  else {
    r = "Done. PASS";
  }
  document.getElementById("finalResults").textContent = r;
};

TestRunner.Exception = {
  toString: function() {
    return "TestRunner.Exception";
  }
};

TestRunner.testFunction = function(f, testList) {
  var r, i, args, expected, test, err;
  for (i = 0; i < testList.length; ++i) {
    test = testList[i];
    if (test.length != 2) {
      TestRunner.log("ERROR: malformed test: " + test);
      TestRunner.fail();
      continue;
    }
    args = test[0];
    expected = test[1];
    err = undefined;
    r = undefined;
    try {
      r = f.apply(null, args);
    }
    catch (e) {
      err = e;
    }
    if (expected === TestRunner.Exception) {
      if (err !== undefined) {
        TestRunner.pass();
        TestRunner.log("PASS: " + test + "with exception: " + err);
      } else {
        TestRunner.fail();
        TestRunner.log("TESTFAIL: expected exception, got " + r);
      }
    }
    else if (err !== undefined) {
      TestRunner.fail();
      TestRunner.log("TESTFAIL: test " + test + " got unexpected exception " + err);
      TestRunner.log(err.stack);
    }
    else if (r === expected || TestRunner.deepEquals(r, expected)) {
      TestRunner.pass();
      TestRunner.log("PASS: " + test);
    } else {
      TestRunner.fail();
      TestRunner.log("TESTFAIL: " + test + " got " + r + " expected " + expected);
    }
  }
};

// Set up the result display immediately
TestRunner.setupResults();

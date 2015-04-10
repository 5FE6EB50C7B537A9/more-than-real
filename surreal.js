/** TODO **
Set.concat
Surreal.times
**/
(function(){
  // inequalities
  function leq(surX, surY) { // !(y <= XL) && !(YR <= x)
    var i;
    for (i = 0; i != surX.L.length; i++) {
      if (leq(surY, surX.L.value[i])) {
        return false;
      }
    }
    for (i = 0; i != surY.R.length; i++) {
      if (leq(surY.R.value[i], surX)) {
        return false;
      }
    }
    return true;
  }
  function geq(surX, surY) { // !(y => XR) && !(YL => x)
    return leq(surY, surX);
    var i;
    for (i = 0; i != surX.R.length; i++) {
      if (geq(surY, surX.R.value[i])) {
        return false;
      }
    }
    for (i = 0; i != surY.L.length; i++) {
      if (geq(surY.L.value[i], surX)) {
        return false;
      }
    }
    return true;
  }
  function lt(surX, surY) {
    return!geq(surX, surY);
  }
  function gt(surX, surY) {
    return!leq(surX, surY);
  }
  function eq(surX, surY) {
    return leq(surX, surY) && geq(surX, surY);
  }
  function neq(surX, surY) {
    return lt(surX, surY) || gt(surX, surY);
  }
  // random stuff
  function warpSurreal(fn) {
    return function(surX, surY) {
      if (this instanceof Surreal) {
        return fn(this, surX);
      }
      return fn(surX, surY);
    }
  }
  function stringify_Set(setA) {
    if (setA.empty) return "{}";
    return "{" + setA.value.map(stringify_Surreal).join(",") + "}";
  }
  function stringify_Surreal(surA) {
    if (surA.empty) return "{{},{}}";
    return "{"+ stringify_Set(surA.L) + "," + stringify_Set(surA.R) + "}";
  }
  function setConcat(setX, setY) {
    return new Set(setX.value.concat(setY.value));
    /* hacky */
    var min = zero, max = zero;
    if (setX.empty) return setY;
    if (setY.empty) return setY;
    min = gt(setX.min, setY.min)
        ? setX.min
        : setY.min;
    max = lt(setX.max, setY.max)
        ? setX.max
        : setY.max;
    return new Set([min, max]);
  }
  // operations
  function opposite_Set(setA) {
    if (setA.empty) return setA;
    return setA.value.map(function(surA){
      return opposite_Surreal(surA);
    })
  }
  function opposite_Surreal(surA) {
    if (surA.empty) return surA;
    return new Surreal(opposite_Set(surA.R), opposite_Set(surA.L));
  }
  function addition_Set(surX, setA) {
    if (setA.empty) return setA;
    return new Set(setA.value.map(function(surY){
      return addition_Surreal(surX, surY);
    }))
  }
  function addition_Surreal(surX, surY) {
    return new Surreal(setConcat(addition_Set(surX, surY.L), addition_Set(surY, surX.L))
                      ,setConcat(addition_Set(surX, surY.R), addition_Set(surY, surX.R)))
  }
  function subtraction(surX, surY) {
    return addition_Surreal(surX, opposite_Surreal(surY));
  }
  // ab = {ALb + aBL − ALBL, ARb + aBR − ARBR | ALb + aBR − ALBR, ARb + aBL − ARBL}
  function multiplication_Set(surX, setA) {
    if (surX.empty || setA.empty) return setA;
  }

  function multiplication_Surreal(surX, surY) {
    if (surX.empty) return surX;
    if (eq(surX, one_positive)) return surY;
    if (eq(surX, one_negative)) return opposite_Surreal(surY);
    if (surY.empty) return surX;
    if (eq(surY, one_positive)) return surX;
    if (eq(surY, one_negative)) return opposite_Surreal(surX);
    
  }
  // objects
  function Set(value) {
    if (!(this instanceof Set)) return new Set(value, false);
    /**
     * this.value (Array)
     *  an ordered array of valid Surreal
     * this.length (Number)
     *  length of the Set
     * this.empty (Boolean)
     *  is the Set empty
     * this.min (Surreal)
     *  the smallest Surreal of the Set
     * this.max (Surreal)
     *  the bigest Surreal of the Set
     */
    var sifted = []
      , length = 0
      , i = 0
      , j = 0
      , min, max, cur;
    if (!(value instanceof Array)) {
      value = new Array(value);
    }
    length = value.length;
    while (i != length) {
      cur = value[i];
      if (cur instanceof Surreal && cur.valid == true) {
        if (j != 0) {
          if (!leq(min, cur)) {
           min = cur;
            sifted = [cur].concat(sifted);
            j ++;
          }
          if (!leq(cur, max)) {
            sifted = sifted.concat(cur);
            max = cur;
            j ++;
          }
        } else {
          min = cur;
          sifted[j] = cur;
          max = cur;
          j = 1;
        }
      }
      i ++;
    }
    if (j == 0) {
      this.value = [];
      this.length = 0;
      this.empty = true;
    } else {
      this.value = sifted.slice();
      this.length = j;
      this.empty = false;
      this.min = min;
      this.max = max;
    }
  }
  function Surreal(setL, setR) {
    if (!(this instanceof Surreal)) return new Surreal(setL, setR, false);
    /**
     * this.L (Set)
     *  left part of the Surreal
     * this.R (Set)
     *  right part of the Surreal
     * this.empty (Boolean)
     *  is the Surreal empty/zero
     * this.valid (Boolean)
     *  is the Surreal well formed
     */
    var i = 0, j = 0, a = 0, b = 0
      , valid = true, sur;
    if (!(setL instanceof Set)) {
      setL = new Set(setL);
    }
    if (!(setR instanceof Set)) {
      setR = new Set(setR);
    }
    this.L = setL; // this.L = setL.max
    this.R = setR; // this.R = setR.min
    a = setR.length;
    b = setL.length;
    if (setL.empty && setR.empty) {
      this.empty = true;
      this.valid = true;
      return this;
    }
    this.empty = false;
    if (!setL.empty && !setR.empty) {
      for (i = 0; i != a; i++) {
        sur = setR.value[i];
        for (j = 0; j != b; j++) {
          if (leq(sur, setL.value[j])) {
            valid = false;
            i = 0;
            j = 0;
            a = 1;
            b = 1;
          }
        }
      }
    }
    this.valid = valid;
  }

  // inequalities
  Surreal.prototype.lessOrEqual = warpSurreal(leq);
  Surreal.prototype.moreOrEqual = warpSurreal(geq);
  Surreal.prototype.less = warpSurreal(lt);
  Surreal.prototype.more = warpSurreal(gt);
  Surreal.prototype.equal = warpSurreal(eq);
  Surreal.prototype.notEqual = warpSurreal(neq);
  // operations
  Surreal.prototype.opposite = warpSurreal(opposite_Surreal);
  Surreal.prototype.plus = warpSurreal(addition_Surreal);
  Surreal.prototype.minus = warpSurreal(subtraction);
  Surreal.prototype.times = warpSurreal("multiplication");

  Surreal.prototype.toString = warpSurreal(stringify_Surreal);

  window.Ensemble = window.Ensemble || Set;
  window.Surreal = window.Surreal || Surreal;
}());

// random tests

time = Date.now();
zero = new Surreal([    ], [    ]);
oneP = new Surreal([zero], [    ]);
oneN = new Surreal([    ], [zero]);
star = new Surreal([zero], [zero]);
// test number validate properly
halves = [new Ensemble([              ]),
          new Ensemble([oneN          ]),
          new Ensemble([     zero     ]),
          new Ensemble([oneN,zero     ]),
          new Ensemble([          oneP]),
          new Ensemble([oneN,     oneP]),
          new Ensemble([     zero,oneP]),
          new Ensemble([oneN,zero,oneP])];
expected = [[!0,!0,!0,!0,!0,!0,!0,!0],
            [!0,!1,!0,!1,!0,!1,!0,!1],
            [!0,!1,!1,!1,!0,!1,!1,!1],
            [!0,!1,!1,!1,!0,!1,!1,!1],
            [!0,!1,!1,!1,!1,!1,!1,!1],
            [!0,!1,!1,!1,!1,!1,!1,!1],
            [!0,!1,!1,!1,!1,!1,!1,!1],
            [!0,!1,!1,!1,!1,!1,!1,!1]];
expected.forEach(function(sub, first){
  sub.forEach(function(result, second){
    console.assert(new Surreal(halves[first], halves[second]).valid == result, first, second, result);
  })
});
twoP = new Surreal([oneP], [    ]);
twoN = new Surreal([    ], [oneN]);
halP = new Surreal([zero], [oneP]);
halN = new Surreal([oneN], [zero]);
// test inequalities
console.assert( oneP.less(twoP));
console.assert( halP.less(oneP));
console.assert( zero.less(halP));
console.assert( halN.less(zero));
console.assert( oneN.less(halN));
console.assert( twoN.less(oneN));
console.assert(!twoP.less(zero));
console.assert(!twoP.less(twoN));
console.assert(!zero.less(twoN));

console.assert( twoP.more(oneP));
console.assert( oneP.more(halP));
console.assert( halP.more(zero));
console.assert( zero.more(halN));
console.assert( halN.more(oneN));
console.assert( oneN.more(twoN));
console.assert(!zero.more(twoP));
console.assert(!twoN.more(twoP));
console.assert(!twoN.more(zero));

console.assert(new Surreal(twoN, twoP).equal(zero));
console.assert(new Surreal(oneN, oneP).equal(zero));
console.assert(new Surreal(halN, halP).equal(zero));
console.assert(new Surreal(twoN, halN).notEqual(zero));
console.assert(new Surreal(oneN, halN).notEqual(zero));
console.assert(new Surreal(halN, halN).notEqual(zero));
// hue words
console.assert(oneP.plus(oneP).equal(twoP));
console.assert(halP.opposite().opposite().equal(halP));
/*
foo = new Surreal(twoN, halP); console.log(foo);
bar = new Surreal(twoN, oneP); console.log(bar);
taz = new Surreal(halN, twoP); console.log(taz);
bar = bar.plus(taz); console.log(bar);
taz = taz.plus(oneP);  console.log(taz);
taz = taz.minus(foo); console.log(taz);
taz = taz.minus(twoP); console.log(taz);
taz = taz.plus(oneP); console.log(taz);
taz = taz.minus(bar); console.log(taz);
if (taz.equal(new Surreal())) {
  document.body.innerHTML = taz.toString();
} else {
  document.body.innerHTML = "something failed";
}
*/
/*
timeDelta = Date.now()-time;
times = JSON.parse(localStorage.getItem("timing")||"[]")
times.push(timeDelta);
if (times.length < 1e3) {
  localStorage.setItem("timing", JSON.stringify(times));
  location.reload();
} else {
  n = 0;
  times.forEach(function(a){n += a});
  console.log("%d %s %d"
    , Math.min.apply(Math, times)
    , (n/1e3).toFixed(2)
    , Math.max.apply(Math, times));
}
*/
// after some extensive tesing (not really) tests take between 1ms and 30ms, mediam being at 1.89ms

/** TODO **
Surreal.toString
Surreal.minus
Set.concat
Surreal.times
**/
(function(){
  function leq(surX, surY) {
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
  function geq(surX, surY) {
    var i;
    for (i = 0; i != surY.L.length; i++) {
      if (leq(surX, surY.L.value[i])) {
        return false;
      }
    }
    for (i = 0; i != surX.R.length; i++) {
      if (leq(surX.R.value[i], surY)) {
        return false;
      }
    }
    return true;
  }
  function lt(surX, surY) {
    var i;
    for (i = 0; i != surY.L.length; i++) {
      if (leq(surX, surY.L.value[i])) {
        return true;
      }
    }
    for (i = 0; i != surX.R.length; i++) {
      if (leq(surX.R.value[i], surY)) {
        return true;
      }
    }
    return false;
  }
  function gt(surX, surY) {
    var i;
    for (i = 0; i != surX.L.length; i++) {
      if (leq(surY, surX.L.value[i])) {
        return true;
      }
    }
    for (i = 0; i != surY.R.length; i++) {
      if (leq(surY.R.value[i], surX)) {
        return true;
      }
    }
    return false;
  }
  function eq(surX, surY) {
    return leq(surX, surY) && geq(surX, surY);
  }
  function neq(surX, surY) {
    return lt(surX, surY) && gt(surX, surY);
  }
  function changeSign_Set(set) {
    if (set.empty) return set;
    return set.value.map(function(surA){
      return changeSign_Surreal(surA);
    })
  }
  function changeSign_Surreal(surA) {
    if (surA.empty) return surA;
    return new Surreal(changeSign_Set(surA.R), changeSign_Set(surA.L));
  }
  function addition_Set(surX, set) {
    if (set.empty) return [];
    return set.value.map(function(surY){
      return addition_Surreal(surX, surY);
    })
  }
  function addition_Surreal(surX, surY) {
    return new Surreal(new Set(addition_Set(surX, surY.L).concat(addition_Set(surY, surX.L)))
                     , new Set(addition_Set(surX, surY.R).concat(addition_Set(surY, surX.R))))
  }
  function Set(value, bypass) {
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
    if (!!bypass) {
      this.value = value;
      this.length = length;
      if (length != 0) {
        this.empty = false;
        this.min = value[0];
        this.max = value[length -1];
      } else {
        this.empty = true;
      }
    } else {
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
    return this;
  }
  function Surreal(setL, setR, bypass) {
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
    if (!!bypass) {
      this.L = setL;
      this.R = setR;
      this.valid = true;
      return this;
    }
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
      this.valid = true;
      this.empty = true;
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
    return this;
  }
  function warpSurreal(fn) {
    return function(surX, surY) {
      if (this instanceof Surreal) {
        return fn(this, surX);
      }
      return fn(surX, surY);
    }
  }

  // inequalities
  Surreal.prototype.lessOrEqual = warpSurreal(leq);
  Surreal.prototype.greaterOrEqual = warpSurreal(geq);
  Surreal.prototype.less = warpSurreal(lt);
  Surreal.prototype.greater = warpSurreal(gt);
  Surreal.prototype.equal = warpSurreal(eq);
  Surreal.prototype.notEqual = warpSurreal(neq);
  // operations
  Surreal.prototype.plus = warpSurreal(addition_Surreal);
  Surreal.prototype.minus = warpSurreal("subtraction");
  Surreal.prototype.times = warpSurreal("multiplication");
  // dunno
  Surreal.prototype.changeSign = function (surX) {
    if (this instanceof Surreal) {
      return changeSign_Surreal(this);
    }
    return changeSign_Surreal(surX);
  }

  window.Set = window.Set || Set;
  window.Surreal = window.Surreal || Surreal;
}());

// random tests

time = +new Date();
zero = new Surreal(); // console.log(zero);
// console.log("---");
oneP = new Surreal([zero], [    ]); // console.log(oneP);
oneN = new Surreal([    ], [zero]); // console.log(oneN);
star = new Surreal([zero], [zero]); // console.log(star);
// console.log("---");
// test number validate properly
halves = [[              ],
          [oneN          ],
          [     zero     ],
          [oneN,zero     ],
          [          oneP],
          [oneN,     oneP],
          [     zero,oneP],
          [oneN,zero,oneP]];
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
    console.assert(new Surreal(halves[first], halves[second]).valid == result, first, second);
  })
});
twoP = new Surreal([oneP], [    ]); // console.log(twoP);
twoN = new Surreal([    ], [oneN]); // console.log(twoN);
halP = new Surreal([zero], [oneP]); // console.log(halP);
halN = new Surreal([oneN], [zero]); // console.log(halN);
// console.log("---");
// test derived inequalities
console.assert(Surreal.prototype.less(twoN, oneN));
console.assert(Surreal.prototype.less(oneN, halN));
console.assert(Surreal.prototype.less(halN, zero));
console.assert(Surreal.prototype.less(zero, halP));
console.assert(Surreal.prototype.less(halP, oneP));
console.assert(Surreal.prototype.less(oneP, twoP));
console.assert(zero.equal(new Surreal(oneN, oneP)));
console.assert(zero.notEqual(new Surreal(oneP, oneN)));
console.assert(oneP.plus(oneP).equal(twoP));
console.assert(twoP.changeSign().changeSign().equal(twoP));

hue = (+new Date())-time;
times = JSON.parse(localStorage.getItem("timing")||"[]").concat(hue);
localStorage.setItem("timing", JSON.stringify(times));
console.log("%d %d", hue, times.length);
if (times.length < 488) location.reload();
n = 0; times.forEach(function(a){n += a}); n;
console.log([Math.min.apply(Math, times),
 (n/488).toFixed(2),
 Math.max.apply(Math, times)]);

// after some extensive tesing (not really) tests take between 1ms and 28ms, mediam being at 2.26ms

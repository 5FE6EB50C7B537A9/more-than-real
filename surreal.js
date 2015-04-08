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
  function Surreal_checkValid(sur) {
    var setL = sur.L, setR = sur.R
      , Ll = setL.length, Rl = setR.length
      , i = 0, j = 0;
    if (Ll == 0 || Rr == 0) {
      return true;
    }
    for (i = 0; i != Ll; i ++) {
      sur0 = setL.value[i];
      for (j = 0; j != Rl; j ++) {
        sur1 = setR.value[j];
        if (leq(sur1, sur0)) {
          return false;
        }
      }
    }
    return true;
  }
  function Set(value, bypass) {
    if (!(this instanceof Set)) return new Set(value, false);
    var sifted = []
      , length = 0
      , i = 0
      , j = 0
      , min, max, cur;
    if (!!bypass) {
      this.value = value;
      this.length = length;
      if (length != 0) {
        this.min = value[0];
        this.max = value[length -1];
      } else {
        this.min = min;
        this.max = max;
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
            }
            if (!leq(cur, max)) {
              sifted = sifted.concat(cur);
              max = cur;
            }
            j ++;
          } else {
            min = cur;
            sifted[j] = cur;
            max = cur;
            j = 1;
          }
        }
        i ++;
      }
      this.min = min;
      this.value = sifted.slice();
      this.max = max;
      this.length = j;
    }
    return this;
  }
  function Surreal(setL, setR, bypass) {
    if (!(this instanceof Surreal)) return new Surreal(setL, setR, false);
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
    a = setR.length;
    b = setL.length;
    if (a != 0 && b != 0) {
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
    this.L = setL;
    this.R = setR;
    this.valid = valid;
    return this;
  }

  Surreal.prototype.lessOrEqual = leq;
  Surreal.prototype.greaterOrEqual = geq;
  Surreal.prototype.less = lt;
  Surreal.prototype.greater = gt;
  Surreal.prototype.equal = eq;
  Surreal.prototype.notEqual = neq;

  window.Set = window.Set || Set;
  window.Surreal = window.Surreal || Surreal;
}());

// random tests

time = +new Date();
zero = new Surreal(); console.log(zero);
console.log("---");
oneP = new Surreal([zero], [    ]); console.log(oneP);
oneN = new Surreal([    ], [zero]); console.log(oneN);
star = new Surreal([zero], [zero]); console.log(star);
console.log("---");
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
twoP = new Surreal([oneP], [    ]); console.log(twoP);
twoN = new Surreal([    ], [oneN]); console.log(twoN);
halP = new Surreal([zero], [oneP]); console.log(halP);
halN = new Surreal([oneN], [zero]); console.log(halN);
console.log("---");
// test derived inequalities
console.assert(Surreal.prototype.less(twoN, oneN));
console.assert(Surreal.prototype.less(oneN, halN));
console.assert(Surreal.prototype.less(halN, zero));
console.assert(Surreal.prototype.less(zero, halP));
console.assert(Surreal.prototype.less(halP, oneP));
console.assert(Surreal.prototype.less(oneP, twoP));
console.assert(Surreal.prototype.equal(zero, new Surreal(oneN, oneP)));
console.assert(Surreal.prototype.notEqual(zero, new Surreal(oneP, oneN)));
console.log((+new Date())-time); // 10 -20- 100 ms

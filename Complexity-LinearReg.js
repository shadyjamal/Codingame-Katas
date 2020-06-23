// Using the Pearson's correlation coefficient (PCC) to measure linear correlation between two variables
// given two arrays of data (X, Y) the PCC is calculated for different pairs:
// (X, Y) (X^2, Y) (X^3, Y) (Log(X), Y) (X * Log(X), Y) (X^2 * Log(X), Y) (X^3 * Log(X), Y) (2^X, Y)
// the best correlation defines the complexity of the programms generating the data
// returns mean of @tab, where @tan is an array of data
const moyenne = (tab) => {
  return Math.round(tab.reduce((a, v) => a + v) / tab.length);
};

// returns the standard deviation of @tab
const ecartType = (tab) => {
  return Math.sqrt(tab.reduce((a, v) => a + Math.pow(v, 2), 0) / tab.length);
};

// returns the Covariance of the pair (tabX, tabY)
const Covariance = (tabX, tabY) => {
  return tabX.reduce((a, v, i) => a + v * tabY[i], 0) / tabX.length;
};

// returns the Pearson's correlation coefficient
const PearsonCoeff = (varX, varY) => {
  const mX = moyenne(varX);
  const mY = moyenne(varY);
  const tabEcartX = varX.map((val) => val - mX);
  const tabEcartY = varY.map((val) => val - mY);
  const ecartX = ecartType(tabEcartX);
  const ecartY = ecartType(tabEcartY);
  const CovXY = Covariance(tabEcartX, tabEcartY);
  const r = Math.abs(CovXY / (ecartX * ecartY));

  if (r < 0.2) return "O(1)";
  return r;
};

let varX = [];
let varY = [];
let oldt = -1;
const N = parseInt(readline());
for (let i = 0; i < N; i++) {
  var inputs = readline().split(" ");
  const num = parseInt(inputs[0]);
  const t = parseInt(inputs[1]);
  varX.push(num);
  varY.push(t);
}
while (true) {
  let resTab = [];

  // Calulates PCC for (X, Y) && (X^2, Y) && (X^3, Y)
  for (let i = 1; i <= 3; i++) {
    const tabX = varX.map((val) => Math.pow(val, i));
    let res = PearsonCoeff(tabX, varY);
    let nPow = "n";
    if (res === "O(1)") return console.log(res);
    else {
      if (i > 1) nPow += `^${i}`;
      resTab.push([res, `O(${nPow})`]);
    }
  }

  // Calulates PCC for (Log(X), Y) && (X * Log(X), Y) && (X^2 * Log(X), Y) && (X^3 * Log(X), Y)
  for (let i = 0; i <= 3; i++) {
    const tabX = varX.map((val) => Math.pow(val, i) * Math.log(val));
    let nPow = "n";
    if (i > 1) nPow += `^${i}`;
    resTab.push([PearsonCoeff(tabX, varY), `O(${i ? `${nPow} ` : ""}log n)`]);
  }

  // Calulates PCC for (2^X, Y)
  const tabX = varX.map((val) => Math.pow(2, val));
  resTab.push([PearsonCoeff(tabX, varY), "O(2^n)"]);

  // sort to find the best Correlation
  resTab.sort((a, b) => b[0] - a[0]);
  
  return console.log(resTab[0][1]);
}

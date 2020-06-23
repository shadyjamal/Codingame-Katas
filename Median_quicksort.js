const N = parseInt(readline());
let houses = [];
let mainY = 0;
let rightX = 0;
let leftX = N;
let length = 0;

function swap(items, leftIndex, rightIndex) {
  var temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
}

function partition(items, left, right) {
  var pivot = items[Math.floor((right + left) / 2)], //middle element
    i = left, //left pointer
    j = right; //right pointer
  while (i <= j) {
    while (items[i] < pivot) {
      i++;
    }
    while (items[j] > pivot) {
      j--;
    }
    if (i <= j) {
      swap(items, i, j); //sawpping two elements
      i++;
      j--;
    }
  }
  return i;
}

function quickSort(items, left, right) {
  var index;
  if (items.length > 1) {
    index = partition(items, left, right); //index returned from partition
    if (left < index - 1) {
      //more elements on the left side of the pivot
      quickSort(items, left, index - 1);
    }
    if (index < right) {
      //more elements on the right side of the pivot
      quickSort(items, index, right);
    }
  }
  return items;
}

const closest = (num, arr) => {
  var mid;
  var lo = 0;
  var hi = arr.length - 1;
  while (hi - lo > 1) {
    mid = Math.floor((lo + hi) / 2);
    if (arr[mid] < num) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (num - arr[lo] <= arr[hi] - num) {
    return arr[lo];
  }
  return arr[hi];
};

if (N === 1) console.log(0);
else {
  for (let i = 0; i < N; i++) {
    var inputs = readline().split(" ");
    const X = parseInt(inputs[0]);
    const Y = parseInt(inputs[1]);
    leftX = leftX < X ? leftX : X;
    rightX = rightX < X ? X : rightX;
    houses.push(Y);
  }
  mainY = Math.ceil(mainY / N);

  houses = quickSort(houses, 0, houses.length - 1);
  mainY = houses[Math.ceil(houses.length / 2) - 1];

  for (let i = 0; i < houses.length; i++) length += Math.abs(houses[i] - mainY);
  length += rightX - leftX;
  console.log(length);
}

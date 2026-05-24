// "Ex 1: Given an array of integers, removing duplicate elements and creating an array whose elements are unique. (Eg: [1,2,2,3,4,4,4,5,6] => [1,2,3,4,5,6]). Find 3-4 ways to solve this.


const arr =  [1,2,2,3,4,4,4,5,6];

function removeDuplicates(arr) { // Using a loop and an array to store unique values
    const uniqueArr = [];
    for (let i = 0; i < arr.length; i++) {
        if (!uniqueArr.includes(arr[i])) {
            uniqueArr.push(arr[i]);
        }
    }
    return uniqueArr;
} 

function removeDuplicatesUsingSet(arr) { // Using a Set to automatically handle duplicates
    return [...new Set(arr)]; // NaN duplcates removed
}

function uniqueReduce(arr) { // Using reduce and a Set to track seen values
  const seen = new Set();
  return arr.reduce((out, v) => {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
    return out;
  }, []);
}

function uniqueSortedInPlace(arr) { // Assumes arr is sorted and using two pointers technique
  if (arr.length === 0) return [];
  const a = arr.slice().sort((x, y) => x - y); // Make a copy and sort it to ensure duplicates are adjacent and to doge mutating the original array
  let j = 0;
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== a[j]) {
      j++;
      a[j] = a[i];
    }
  }
  return a.slice(0, j + 1);
}


function removeDuplicatesUsingObject(arr) {
  const seen = Object.create(null);
  const result = [];

  for (const num of arr) {
    if (!seen[num]) {
      seen[num] = true;
      result.push(num);
    }
  }

  return result;
}

console.log(removeDuplicates(arr));
console.log(removeDuplicatesUsingSet(arr));
console.log(uniqueReduce(arr));
console.log(uniqueSortedInPlace(arr));
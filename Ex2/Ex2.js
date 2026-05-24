// Ex 2: Given an array of integers, find integers with the most repetitions. If multiple numbers have the same maximum number of repetition, export all of them.
// Maximum 3 rounds, not nested.

function mostFrequent(arr) {
    const freq = new Map();

    let max = 0;
    const  res = [];

    for (const x of arr){
        const count = (freq.get(x) || 0) + 1;
        freq.set(x, count);

        if (count > max){
            max = count;
            res.length = 0;
            inRes.clear();
            res.push(x);
        }
        else if (count === max) {
            res.push(x);
        }
    }
    return res;
}


function mostFrequent(arr) {
  const result = arr.reduce(
    (acc, x) => {
      const count = (acc.freq.get(x) || 0) + 1;
      acc.freq.set(x, count);

      if (count > acc.max) {
        acc.max = count;
        acc.res.length = 0;
        acc.res.push(x);
      } else if (count === acc.max) {
        acc.res.push(x);
      }

      return acc;
    },
    {
      freq: new Map(),
      max: 0,
      res: []
    }
  );

  return result.res;
}

const arr = [1, 1, 2, 2, 3];
console.log(mostFrequent(arr)); // [1, 2]

const arr = [1,1,2,2,3]
console.log(mostFrequent(arr));
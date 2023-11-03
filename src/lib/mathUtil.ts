export function calculateAverageWithMinMax(numbers: number[]): {
  average: number;
  slowest: number;
  fastest: number;
} {
  if (numbers.length === 0) {
    throw new Error("Array is empty");
  }

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  const highest = Math.max(...numbers);
  const lowest = Math.min(...numbers);

  return { average, slowest: highest, fastest: lowest };
}

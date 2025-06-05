function getPrimeNumbersUpTo(max) {
  const primes = [1]; // Incluimos manualmente el ID 1 (Rick)
  for (let num = 2; num <= max; num++) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(num);
    }
  }
  return primes;
}

module.exports = { getPrimeNumbersUpTo };

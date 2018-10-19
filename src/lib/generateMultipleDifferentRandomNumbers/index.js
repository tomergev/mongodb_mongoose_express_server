const generateRandomNumber = require('../generateRandomNumber/');

module.exports = ({ limit, max }) => {
  const firstRandomNumber = generateRandomNumber({ min: 0, max: max - 1 });
  const randomNumbers = [firstRandomNumber];

  // Starting the count on one because the first random number has already been generated
  for (let count = 1; count < limit; count += 1) {
    const randomNumber = (randomNumbers[count - 1] + 1) % max;
    randomNumbers.push(randomNumber);
  }

  return randomNumbers;
};

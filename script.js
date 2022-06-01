'use strict';

/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach((movement, index) => {
    const movementType = movement > 0 ? 'deposit' : 'withdrawal';

    const movementRowHTML = `<div class="movements__row">
        <div class="movements__type 
        movements__type--${movementType}">${index + 1} ${movementType}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement}€</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', movementRowHTML);
  });
};

const createInitials = function (username) {
  return username.reduce((total, current) => (total += current[0]), '');
};

const createUsernames = function (accounts) {
  accounts.forEach(account => {
    const username = account.owner.toLowerCase().split(' ');
    account.username = createInitials(username);
  });
};

createUsernames(accounts);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const calcDisplayBalance = function (account) {
  const { movements } = account;
  account.balance = movements.reduce((total, current) => (total += current), 0);
  labelBalance.textContent = `${account.balance}€`;
};

const calcDisplaySummaryIn = function (movements) {
  const deposits = movements.filter(movement => movement > 0);

  const totalDeposits = deposits.reduce((total, current) => total + current, 0);

  labelSumIn.textContent = `${totalDeposits}€`;
};

const calcDisplaySummaryOut = function (movements) {
  const withdrawal = movements.filter(movement => movement < 0);

  const totalWithdraws = withdrawal.reduce(
    (total, current) => total + current,
    0
  );

  labelSumOut.textContent = `${-totalWithdraws}€`;
};

const calcDisplaySummaryInterest = function (movements, interestRate) {
  const deposits = movements.filter(movement => movement > 0);

  const interestPercentages = deposits.map(
    deposit => (deposit * interestRate) / 100
  );

  const filteredInterests = interestPercentages.filter(current => current >= 1);

  const totalInterest = filteredInterests.reduce(
    (total, current) => total + current,
    0
  );

  labelSumInterest.textContent = `${totalInterest.toFixed(2)}€`;
};

const max = function (movements) {
  return Math.max.apply(null, movements);
};

const timer = function (minutes) {
  setInterval(function () {
    minutes -= 0.01;
    labelTimer.textContent = minutes.toFixed(2);
  }, 1000);
};
timer(5);

let currentUser;
let isSorted = false;

const updateUI = function (user) {
  const { movements, interestRate } = user;

  displayMovements(movements);
  calcDisplayBalance(user);
  calcDisplaySummaryIn(movements);
  calcDisplaySummaryOut(movements);
  calcDisplaySummaryInterest(movements, interestRate);
};

const login = function (event) {
  event.preventDefault();

  const user = accounts.find(
    ({ username, pin }) =>
      username === inputLoginUsername.value &&
      pin === Number(inputLoginPin.value)
  );

  inputLoginUsername.value = '';
  inputLoginPin.value = '';

  if (!user) return;

  labelWelcome.textContent = `Welcome back, ${user.owner.split(' ')[0]}`;
  containerApp.style.opacity = 100;
  currentUser = user;

  updateUI(currentUser);
};

const transfer = function (event) {
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    ({ username }) => username === inputTransferTo.value
  );

  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  if (
    !receiverAccount ||
    amount <= 0 ||
    currentUser.balance < amount ||
    currentUser.username === receiverAccount.username
  )
    return;

  currentUser.movements.push(-amount);
  receiverAccount.movements.push(amount);
  updateUI(currentUser);
};

const loan = function (event) {
  event.preventDefault();

  const amount = Number(inputLoanAmount.value);
  const isAllowedToLoan = currentUser.movements.some(
    current => current >= amount * 0.1
  );

  inputLoanAmount.value = '';

  if (amount <= 0 || !isAllowedToLoan) return;

  currentUser.movements.push(amount);

  updateUI(currentUser);
};

const closeAccount = function (event) {
  event.preventDefault();

  const selectedUsername = inputCloseUsername.value;
  const selectedUserPin = inputClosePin.value;
  const { username: currentUsername, pin } = currentUser;

  if (selectedUsername === currentUsername && Number(selectedUserPin) === pin) {
    const index = accounts.findIndex(
      ({ username }) => username === currentUsername
    );

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = '';
  inputClosePin.value = '';
};

const sortMovements = function (event) {
  event.preventDefault();

  if (isSorted) {
    isSorted = false;
    return displayMovements(currentUser.movements);
  }

  const sortedMovements = [...currentUser.movements].sort((a, b) => a - b);
  isSorted = true;

  displayMovements(sortedMovements);
};

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

/////////////////////////////////////////////////
btnLogin.addEventListener('click', login);
btnTransfer.addEventListener('click', transfer);
btnClose.addEventListener('click', closeAccount);
btnLoan.addEventListener('click', loan);
btnSort.addEventListener('click', sortMovements);

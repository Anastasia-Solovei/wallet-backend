const Transaction = require('../model/transaction_schema');
const { Category } = require('../config/constants');
const getAllCategories = require('./categoriesRepository');

const getAllTransactions = async userId => {
  return await Transaction.find({ owner: userId });
};

const getStatistics = async (userId, month, year) => {
  return await Transaction.find({ owner: userId, month: month, year: year });
};

const getStatisticsByCategories = arrayTransactions => {
  const sumCategories = {
    main: 0,
    food: 0,
    car: 0,
    me: 0,
    children: 0,
    house: 0,
    education: 0,
    leisure: 0,
    other: 0,
    incomes: 0,
  };

  Category.expenses.forEach(categoryExp => {
    arrayTransactions.forEach(item => {
      if (item.category === categoryExp) {
        sumCategories[categoryExp] += item.amount;
      }
    });
  });

  arrayTransactions.forEach(item => {
    if (item.type === 'incomes') {
      sumCategories.incomes += item.amount;
    }
  });

  return sumCategories;
};

let incomesSum = 0;
let expensesSum = 0;
const addTransaction = async body => {
  const { type } = body;

  const amount = +body.amount;
  console.log('amount', amount);

  const incomes = await Transaction.find({
    type: 'incomes',
    owner: body.owner,
  });
  const expenses = await Transaction.find({
    type: 'expenses',
    owner: body.owner,
  });

  if (incomes.length === 0 && expenses.length === 0) {
    body.balance = amount;
  }

  if (type === 'incomes' && incomes.length > 0) {
    const { incomesBalance } = incomes[incomes.length - 1];
    body.incomesBalance = incomesBalance + amount;
    incomes[incomes.length - 1].incomesBalance = incomesBalance + amount;
    incomesSum = incomes[incomes.length - 1].incomesBalance;
  } else if (type === 'expenses' && expenses.length > 0) {
    const { expensesBalance } = expenses[expenses.length - 1];
    body.expensesBalance = expensesBalance + amount;
    expenses[expenses.length - 1].expensesBalance = expensesBalance + amount;
    expensesSum = expenses[expenses.length - 1].expensesBalance;
  } else if (type === 'incomes' && incomes.length === 0) {
    body.incomesBalance = amount;
    incomesSum = amount;
    expensesSum = 0;
  } else if (type === 'expenses' && expenses.length === 0) {
    body.expensesBalance = amount;
    expensesSum = amount;
    incomesSum = 0;
  }

  body.balance = incomesSum - expensesSum;

  return await Transaction.create(body);
};

const editTransaction = async (transactionId, body, userId) => {
  return await Transaction.findOneAndUpdate(
    { _id: transactionId, owner: userId },
    { ...body },
    { new: true },
  );
};

const deleteTransaction = async (transactionId, userId) => {
  return await Transaction.findOneAndRemove({
    _id: transactionId,
    owner: userId,
  });
};

module.exports = {
  getStatistics,
  getAllTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
  getStatisticsByCategories,
};

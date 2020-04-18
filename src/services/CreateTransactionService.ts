import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (
      type === 'outcome' &&
      (await transactionRepository.getBalance()).total - value < 0
    ) {
      throw new AppError('Invalid transaction.');
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let category_id;

    if (!checkCategoryExists) {
      const newCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(newCategory);

      category_id = newCategory.id;
    } else {
      category_id = checkCategoryExists.id;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

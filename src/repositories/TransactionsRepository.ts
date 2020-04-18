import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (accumulation, current) => {
        return current.type === 'income'
          ? ({
              income: accumulation.income + current.value,
              outcome: accumulation.outcome,
              total: accumulation.total + current.value,
            } as Balance)
          : ({
              income: accumulation.income,
              outcome: accumulation.outcome + current.value,
              total: accumulation.total - current.value,
            } as Balance);
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      } as Balance,
    );

    return balance;
  }
}

export default TransactionsRepository;

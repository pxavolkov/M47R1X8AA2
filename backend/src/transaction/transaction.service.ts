import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionType } from '@shared/enums';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async addTransaction(fromId: number, toId: number, amount: number, type: TransactionType): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.fromUserId = fromId;
    transaction.toUserId = toId;
    transaction.amount = amount;
    transaction.type = type;
    return await this.transactionRepository.save(transaction);
  }

  async transfer(fromId: number, toId: number, amount: number): Promise<Transaction> {
    return this.addTransaction(fromId, toId, amount, TransactionType.TRANSFER);
  }

  async mining(toId: number, amount: number): Promise<Transaction> {
    return this.addTransaction(null, toId, amount, TransactionType.MINING);
  }
}
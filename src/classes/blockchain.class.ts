import * as SHA256 from 'crypto-js/sha256';
import { Block } from './block.class';
import { Transaction } from './transaction.class';

export class Blockchain {
  chain: Block[] = [];
  difficulty: number = 3;
  mingingReward: number = 50;
  registeredAddresses: string[] = [];
  
  constructor() {
    //this.chain = [ this.createGenesisBlock() ];
    this.createGenesisBlock();
    this.registeredAddresses = [ 'wallet-Alice', 'wallet-Bob', 'wallet-Charlie', 'wallet-Miner49r'];
    this.airdropCoins( 100 );
  }
  
  airdropCoins( coins ) {
    let airdropTxns: Transaction[] = [];
    for ( const addr of this.registeredAddresses ) {
      let txn = new Transaction( Date.now(), "mint", addr, coins );
      airdropTxns.push( txn );
    }
    this.mineCurrentBlock(' wallet-Miner49r', airdropTxns );
  }
  
  createGenesisBlock() {
    let txn = new Transaction( Date.now(), "mint", "genesis", 0 );
    let block = new Block( Date.now(), [ txn ], "0" );
    this.chain.push( block );
    //return new Block( 0, "15/01/2018", "Genesis Block", "0" );
  }
  
  getLatestBlock() {
    return this.chain[ this.chain.length - 1];
  }
  
  /*addBlock( newBlock, this.difficulty ) {
    newBlock.previousHash = this.getLatestBlock().hash;
    //newBlock.hash = newBlock.calculateHash();
    newBlock.mineBlock( this.difficulty );
    this.chain.push( newBlock );
  }*/
  
  mineCurrentBlock( minerAddr: string, transaction: Transaction[]): Promise<any> {
    let validateTxns: Transaction[] = [];
    for ( const txn of validateTxns ) {
      if ( txn.payerAddr === 'mint' || this.validateTransaction( txn )) {
           validateTxns.push( txn );
       }
    }
    console.log(" Validated Transactions: " + validateTxns.length );
    
    validateTxns.push(new Transaction( Date.now(), "mint", minerAddr, this.mingingReward ));
    let promise = new Promise(( resolve, reject ) => {
      let block = new Block( Date.now(), validateTxns, this.getLatestBlock().hash );
      block.mineBlock( this.difficulty ).then( () => {
        console.log("Current Block successfully minde...");
        this.chain.push( block );
        resolve();
      });
    });
    return promise;
  }
  
  validateTransaction( txn ) {
    let payerAddr = txn.payerAddr;
    let balance = this.getAddressBalance( payerAddr );
    if ( balance >= txn.amount ) {
         return true;
    } else {
      return false;
    }
  }
  
  getAddressBalance( addr ) {
    let balance = 0;
    for ( const block of this.chain ) {
      for ( const txn of block.txns ) {
        if (txn.payerAddr === addr) {
              balance -= txn.amount;
         }
        if (txn.payeeAddr === addr ) {
          balance += txn.amount;
        }
      }
    }
    return balance;
  }
  
  isChainValid() {
    for ( let i = 1; i < this.chain.length; i++ ) {
      const currentBlock = this.chain[ i ];
      const previousBlock = this.chain[ i - 1 ];
      
      //validate data integrity
      if ( currentBlock.hash !== currentBlock.calculateHash() ) {
        return false;
      }
      
      //validate hash chain link
      if ( currentBlock.previousHash !== previousBlock.hash ) {
          return false;
       }
    }
    
    //all good. no manipulated data or bad links
    return true;
  }
}
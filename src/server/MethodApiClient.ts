import {Method, Environments, AccountCapabilities } from 'method-node'
import { MongoCursorExhaustedError } from 'mongodb';
import { resolveTypeReferenceDirective } from 'typescript';

export default class MethodApiClient {
  method: Method
  constructor(apiKey: any, env: any) {
    this.method = new Method({
      apiKey: apiKey,
      env: env
    });
  }

  async methodCreateEntity (employeeObj: any, type?: string) {
    if(type) {
      const comp = 'Google'
        // do method ent creation and account creation thing here
      const corp = await this.method.entities.create({
        type: 'c_corporation',
        corporation: {
          name: comp,
          ein: '32120240',
          owners: [],
        },
        address: {
          line1: '615 Minyard Drive',
          line2: null,
          city: 'Coppell',
          state: 'TX',
          zip: '75019'
        }
      })

      return corp
    } else {
      // private method to create entities
      const employee = await this.method.entities.create({
        type: 'individual',
        individual: {
            first_name: employeeObj.Employee.FirstName._text,
            last_name: employeeObj.Employee.LastName._text,
            phone: '+15121231111',
          },
        metadata: {
          dunkinId: employeeObj.Employee.DunkinId._text,
          dunkinBranch: employeeObj.Employee.DunkinBranch._text
        }
      })
      return employee
    }

  }

  async apiPing () {
    const response = this.method.ping()
    return response
  }

  async createLiabilityAccount (holderId: string, mchId: string, accNumber: string ) {
    // this middleware will create a destination/liability account for the employee entity

    const newAccount = await this.method.accounts.create({
      holder_id: holderId,
      liability: {
        mch_id: mchId,
        account_number: accNumber
      }
    })

    return newAccount
  }

  async createAchAccount (holderId: string, routingNum: string, accNumber: string) {
    // this middleware will create a source/ACH account for the paying source entity
    try {
      const newAchAccount = await this.method.accounts.create({
        holder_id: holderId,
        ach: {
          routing: routingNum,
          number: accNumber,
          type: 'checking'
        }
      })
      return newAchAccount
    } catch (err: any) {
      return err.sub_type
    }
  }

  /*
  MethodInvalidRequestError: Invalid ACH description received. The ach description should be a string with a maximum of 10 characters.
  */
  async makePayment (destinationId: string, sourceId: string, amount: number) {
    // this middleware will make a payment on behalf of the passed in values
    try {
      const payment = await this.method.payments.create({
        amount: amount,
        source: sourceId,
        destination: destinationId,
        description: 'Loan Pmt'
      })
    
      return payment
      
    } catch (err: any) {
      // an error has occured. 

      // return null and handle on server side
      return null
    }
  }

  async findMchId(plaidId: string) {
    // this middleware will check method api for merchants possessing the specified plaidId. will return false if none found
      const result = await this.method.merchants.list({'provider_id.plaid': plaidId})
  
      return result !== undefined ? result[0].mch_id : null
  }
}
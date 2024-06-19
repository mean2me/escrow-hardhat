import { BigNumber } from 'ethers'

const OBJECT_STORE = 'escrows'
const DB_NAME = 'Escrow'
class EscrowDB {
  constructor() {
    let db
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = (err) => console.error(err)

    request.onsuccess = (e) => {
      db = e.target.result
    }

    request.onupgradeneeded = (e) => {
      const store = db.createObjectStore(OBJECT_STORE, {
        keyPath: 'address',
      })
      store.createIndex('arbiter', 'arbiter', { unique: false })
      store.createIndex('payer', 'payer', { unique: false })
      store.createIndex('approved', 'approved', { unique: false })
    }
  }

  async db() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onerror = (err) => {
        console.error(err)
        reject(err)
      }

      request.onsuccess = (e) => {
        resolve(e.target.result)
      }
    })
  }

  /**
   * @returns {IDBObjectStore}
   */
  async getStore() {
    const db = await this.db()
    return db.transaction(OBJECT_STORE).objectStore(OBJECT_STORE)
  }

  /**
   * @param {string} payer Payer address
   * @param {string} arbiter Arbiter address
   * @param {boolean} approved escrow's status
   * @returns {Promise<Array<{ address:string, arbiter:string, payer:string, beneficiary:string, value:number}>>}
   */
  async list(payer, arbiter, approved) {
    return new Promise(async (resolve, reject) => {
      try {
        const store = await this.getStore()

        const cur = store?.openCursor()
        let escrows = []
        if (cur) {
          cur.onsuccess = (e) => {
            const cursor = e.target.result
            if (cursor) {
              let push = true
              if (
                payer &&
                !BigNumber.from(payer).eq(BigNumber.from(cursor.value.payer))
              ) {
                push = false
              }
              if (
                arbiter &&
                !BigNumber.from(arbiter).eq(
                  BigNumber.from(cursor.value.arbiter),
                )
              ) {
                push = false
              }
              if (approved !== null && approved !== cursor.value.approved) {
                push = false
              }
              push && escrows.push(cursor.value)
              cursor.continue()
            } else {
              resolve(escrows)
            }
          }
        } else {
          resolve(escrows)
        }
      } catch (err) {
        console.error(err)
      }
    })
  } //

  async getEscrow(address) {
    return new Promise(async (resolve, reject) => {
      try {
        const store = await this.getStore()

        const req = store.get(address)
        req.onerror = (err) => {
          reject(err)
        }
        req.onsuccess = (evt) => {
          resolve(evt.target.result)
        }
      } catch (err) {
        console.error(err)
      }
    })
  }

  /**
   * @param {object} item
   * @param {string} item.address
   * @param {string} item.payer
   * @param {string} item.arbiter
   * @param {string} item.beneficiary
   * @param {number} item.value
   */
  async saveEscrow(item) {
    return new Promise(async (resolve, reject) => {
      const db = await this.db()
      const tx = db.transaction(OBJECT_STORE, 'readwrite')
      tx.onsuccess = (e) => resolve(true)
      tx.onerror = (e) => reject(e)
      const store = tx.objectStore(OBJECT_STORE)
      store.add(item)
    })
  }
}

export const db = new EscrowDB()
// try {
//   await db.saveEscrow({
//     address: '0x3',
//     arbiter: '0x1',
//     beneficiary: '0x0',
//     payer: '0x0',
//     value: 1,
//   })
// } finally {
//   console.log(await db.list(null, '0x1', null))
//   console.log(await db.getEscrow('0x0'))
// }

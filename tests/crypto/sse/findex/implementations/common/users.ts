import { USERS } from "./users_dataset"

export interface User {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  country: string
  region: string
  employeeNumber: string
  security: string
  enc_uid: string
}
export interface UserExtract {
  firstName: string
  lastName: string
  phone: string
  email: string
  country: string
  region: string
  employeeNumber: string
  security: string
}

export class Users {
  private readonly _users: User[]

  constructor() {
    this._users = USERS
  }

  getUsers(): User[] {
    return this._users
  }

  getUsersById(uids: string[]): User[] {
    return this._users.filter((element) => {
      return uids.includes(element.id)
    })
  }

  getFirstUsers(): UserExtract[] {
    const firstUsers: UserExtract[] = []

    for (let i = 0; i < 5; i++) {
      firstUsers.push({
        firstName: this._users[i].firstName,
        lastName: this._users[i].lastName,
        phone: this._users[i].phone,
        email: this._users[i].email,
        country: this._users[i].country,
        region: this._users[i].region,
        employeeNumber: this._users[i].employeeNumber,
        security: this._users[i].security,
      })
    }

    return firstUsers
  }

  upsertUserEncUidById(id: string, encryptedUid: { enc_uid: string }): void {
    for (let i = 0; i < this._users.length; i++) {
      if (this._users[i].id !== id) {
        continue
      }
      this._users[i].enc_uid = encryptedUid.enc_uid
      break
    }
  }
}

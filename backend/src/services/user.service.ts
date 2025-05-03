import * as userModel from '../models/user.model';

export const getAllUsers = async () => {
  return await userModel.findAllUsers();
};

export function createUser(body: any) {
    throw new Error('Function not implemented.');
}

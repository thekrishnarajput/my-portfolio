import User, { IUser } from '../models/User';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email }).exec();
    }

    async findById(id: string): Promise<IUser | null> {
        return User.findById(id).exec();
    }

    async create(data: Partial<IUser>): Promise<IUser> {
        const user = new User(data);
        return user.save();
    }

    async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }
}


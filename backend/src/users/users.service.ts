import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userReposity: Repository<User>,
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userReposity.create(createUserDto);
    return await this.userReposity.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userReposity.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userReposity.findOne({ where: { id } });
    if(!user){
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updateUser = Object.assign(user, updateUserDto);
    return await this.userReposity.save(updateUser);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userReposity.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}

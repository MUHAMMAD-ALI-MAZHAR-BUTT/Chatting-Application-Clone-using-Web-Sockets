// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from 'src/dto/user-register.dto';
import { User } from './../schemas/user.schema';
import { LoginDto } from 'src/dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(userDto: UserRegisterDto): Promise<any> {
    const { password, ...rest } = userDto;
    const hashedPassword = await this.hashPassword(password);
    const createdUser = new this.userModel({
      ...rest,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async login(loginUserDto: LoginDto): Promise<{ accessToken: string }> {
    const { username, password } = loginUserDto;
    const user = await this.userModel.findOne({ username });
    const userID = user.id;
    if (user && (await this.validatePassword(password, user.password))) {
      const payload = { userID };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  getUserDetails(token: string) {
    try {
      const decodedToken = this.jwtService.verify(token);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async findAll(): Promise<{ id: string; username: string }[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => ({ id: user._id, username: user.username }));
  }

  async validatePassword(
    enteredPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, dbPassword);
  }
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}

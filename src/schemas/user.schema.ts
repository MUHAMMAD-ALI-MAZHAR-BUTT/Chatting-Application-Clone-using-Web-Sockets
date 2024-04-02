import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsEmail } from 'class-validator';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @Prop({ required: true, unique: true })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

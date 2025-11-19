import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose({ name: '_id' })
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  isActive: boolean;

  @Expose()
  roles: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

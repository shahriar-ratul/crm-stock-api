import { ApiProperty } from "@nestjs/swagger";
import { $Enums, Admin, AdminRole } from "@prisma/client";

export class AdminEntity implements Admin {
  isVerified: boolean;
  verifiedAt: Date;
  firstName: string;
  lastName: string;
  dob: Date;
  telegramName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  nationality: string;
  zipCode: string;
  documentType: $Enums.DocumentUploadType;
  walletBalance: number;
  deleted: boolean;
  deletedBy: number;
  deletedAt: Date;

  @ApiProperty({ type: 'integer', description: 'id' })
  id: number;

  @ApiProperty({
    type: 'string',
    description: 'admin name',
  })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'admin photo',
  })
  photo: string;

  @ApiProperty({
    type: 'string',
    description: 'admin username must be unique',
  })
  username: string;

  @ApiProperty({ type: 'email', description: 'admin email must be unique' })
  email: string;

  @ApiProperty({ type: 'string', description: 'admin phone must be unique' })
  phone: string;

  @ApiProperty({ type: 'string', description: 'admin password' })
  password: string;

  @ApiProperty({ type: 'boolean', description: 'item is active or not' })
  isActive: boolean;

  @ApiProperty({ description: 'When user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When user was updated' })
  updatedAt: Date;

  @ApiProperty({
    description: "Admin's role",
    isArray: true,
  })
  roles: AdminRole[];

  @ApiProperty({
    description: "Admin's role",
    isArray: true,
  })
  permissions: string[];
}

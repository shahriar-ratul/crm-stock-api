import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { AdminResponse } from '../admins/interface/AdminResponse';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { getImageUrl } from '@/common/helpers/GenerateHelpers';

@Injectable()
export class UserService {
  constructor(
    private readonly _prisma: PrismaService,
  ) { }


  async findAll(query: PageOptionsDto): Promise<PageDto<AdminResponse>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'id';

    const order = query.order || 'asc';


    const queryData: Prisma.AdminFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
        isVerified: true,
        roles: {
          every: {
            role: {
              slug: 'user',
            }
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true,
          }
        },
      },

      take: limit,
      skip: skip,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
    };
    const [items, count] = await this._prisma.$transaction([
      this._prisma.admin.findMany(queryData),
      this._prisma.admin.count({ where: queryData.where })
    ]);


    const transformedResult = items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delete item.password;
      return item;
    });

    const pageOptionsDto = {
      limit: limit,
      page: page,
      skip: skip,
    };


    const pageMetaDto = new PageMetaDto({
      total: count,
      pageOptionsDto: pageOptionsDto,
    });


    return new PageDto(transformedResult, pageMetaDto);


  }

  // add admin
  async create(createDto: CreateUserDto, files: Array<Express.Multer.File>) {
    const checkAdmin = await this._prisma.admin.findFirst({
      where: {
        OR: [
          { email: createDto.email },
          { username: createDto.username },
          { phone: createDto.phone },
        ],
      }
    });

    if (checkAdmin) {
      throw new HttpException('user already exists ', HttpStatus.BAD_REQUEST);
    }

    const password = await hash(createDto.password, 15);



    const admin = await this._prisma.admin.create({
      data: {
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        username: createDto.username,
        phone: createDto.phone,
        password: password,
        isActive: false,
        addressLine1: createDto.addressLine1,
        addressLine2: createDto.addressLine2,
        city: createDto.city,
        state: createDto.state,
        nationality: createDto.nationality,
        zipCode: createDto.zipCode,
        dob: createDto.dob,
        telegramName: createDto.telegramName,
        documentType: createDto.documentType,
        walletBalance: 0,
      },
    });

    if (files && files.length > 0) {

      files.map(async (file) => {
        await this._prisma.upload.create({
          data: {
            adminId: admin.id,
            documentType: createDto.documentType,
            fileName: file.filename,
            url: file.path,
            size: file.size,
            type: file.mimetype,
          },
        })
      });
    }


    const userRole = await this._prisma.role.findFirst({
      where: {
        slug: 'user',
      },
    });

    await this._prisma.adminRole.create({
      data: {
        adminId: admin.id,
        roleId: userRole.id,
      },
    });



    return {
      message: 'User Request Added Successfully',
    };
  }


  // get admin by id
  async findById(id: number) {
    const admin = await this._prisma.admin.findUnique({
      where: {
        id: id,
      },
      include: {
        roles: {
          select: {
            roleId: true,
            role: {
              select: {
                id: true,
                isActive: true,
                name: true,
                slug: true,
              }
            },
          }
        },
        uploads: true,
      },
    });

    delete admin.password;

    // convert upload path to link
    if (admin.uploads && admin.uploads.length > 0) {
      admin.uploads.map((upload) => {
        upload.url = getImageUrl(upload.url);
      });
    }



    return {
      data: admin,
    };

  }

  async update(id: number, updateDto: UpdateUserDto) {
    const data = await this._prisma.admin.findFirst({
      where: {
        id: id,
      },
    });

    if (!data) {
      throw new HttpException('Admin Not Found ', HttpStatus.BAD_REQUEST);
    }

    // check if email or username or phone exists
    const checkAdmin = await this._prisma.admin.findFirst({
      where: {
        NOT: {
          id: id,
        },
        OR: [
          { email: updateDto.email },
          { username: updateDto.username },
          { phone: updateDto.phone },
        ],
      }
    });

    if (checkAdmin) {
      throw new HttpException('Admin already exists ', HttpStatus.BAD_REQUEST);
    }


    await this._prisma.admin.update({
      where: {
        id: id,
      },
      data: {
        email: updateDto.email ? updateDto.email : data.email,
        username: updateDto.username ? updateDto.username : data.username,
        phone: updateDto.phone ? updateDto.phone : data.phone,
        isActive: data.isActive,

      },
    });




    if (updateDto.password) {
      const password = await hash(updateDto.password, 15);

      await this._prisma.admin.update({
        where: {
          id: id,
        },
        data: {
          password: password,
        },
      });
    }



    const adminData = await this._prisma.admin.findUnique({
      where: {
        id: id,
      },
      include: {
        roles: {
          select: {
            roleId: true,
            role: {
              select: {
                id: true,
                isActive: true,
                name: true,
                slug: true,
              }
            },
          }
        },
      },
    });

    delete adminData.password;

    return {
      data: adminData,
      message: 'Admin Updated Successfully',
    };
  }


  async remove(id: number) {

    const admin = await this._prisma.admin.findFirst({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          }
        },
      },
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }

    if (admin.roles.length > 0) {
      // superadmin role cannot be deleted
      if (admin.roles.find((role) => role.role.slug === 'superadmin')) {
        throw new HttpException(
          'SuperAdmin role cannot be deleted',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // delete admin

    await this._prisma.admin.delete({
      where: {
        id: id,
      },
    });

    return {
      message: 'Admin deleted successfully',
    };
  }


  // get unverified users
  async findAllUnVerified(query: PageOptionsDto): Promise<PageDto<AdminResponse>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'createdAt';

    const order = query.order || 'desc';


    const queryData: Prisma.AdminFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
        isVerified: false,
        roles: {
          every: {
            role: {
              slug: 'user',
            }
          }
        }
      },

      include: {
        roles: {
          include: {
            role: true,
          }
        },
      },

      take: limit,
      skip: skip,
      orderBy: {
        [sort]: Prisma.SortOrder[order.toLowerCase() as 'asc' | 'desc'],

      },
    };


    const [items, count] = await this._prisma.$transaction([
      this._prisma.admin.findMany(queryData),
      this._prisma.admin.count({ where: queryData.where })
    ]);


    const transformedResult = items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delete item.password;
      return item;
    });

    const pageOptionsDto = {
      limit: limit,
      page: page,
      skip: skip,
    };


    const pageMetaDto = new PageMetaDto({
      total: count,
      pageOptionsDto: pageOptionsDto,
    });


    return new PageDto(transformedResult, pageMetaDto);


  }


  // verify

  async verify(id: number) {
    const admin = await this._prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!admin) {
      throw new HttpException('User Not Found ', HttpStatus.BAD_REQUEST);
    }

    await this._prisma.admin.update({
      where: {
        id: id,
      },
      data: {
        isActive: true,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return {
      message: 'Admin Verified Successfully',
    };
  }



  async changeStatus(id: number) {
    const admin = await this._prisma.admin.findFirst({
      where: { id },
    });

    if (!admin) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }


    await this._prisma.admin.update({
      where: {
        id: id,
      },
      data: {
        isActive: !admin.isActive,
      },
    });

    return {
      message: 'Status Changed successfully',
    };
  }

  // get unverified users
  async findAllWallet(query: PageOptionsDto): Promise<PageDto<AdminResponse>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'createdAt';

    const order = query.order || 'desc';


    const queryData: Prisma.AdminFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
        isVerified: true,
        roles: {
          some: {
            role: {
              slug: 'user',
            }
          },
          none: {
            role: {
              slug: "superadmin"
            }
          }
        }
      },

      include: {
        roles: {
          include: {
            role: true,
          }
        },
      },

      take: limit,
      skip: skip,
      orderBy: {
        [sort]: Prisma.SortOrder[order.toLowerCase() as 'asc' | 'desc'],

      },
    };


    const [items, count] = await this._prisma.$transaction([
      this._prisma.admin.findMany(queryData),
      this._prisma.admin.count({ where: queryData.where })
    ]);


    const transformedResult = items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delete item.password;
      return item;
    });

    const pageOptionsDto = {
      limit: limit,
      page: page,
      skip: skip,
    };


    const pageMetaDto = new PageMetaDto({
      total: count,
      pageOptionsDto: pageOptionsDto,
    });


    return new PageDto(transformedResult, pageMetaDto);


  }


}

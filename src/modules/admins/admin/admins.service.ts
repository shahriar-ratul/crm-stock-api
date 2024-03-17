import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { AdminResponse } from '../interface/AdminResponse';
import { hash } from 'bcrypt';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminsService {
  constructor(
    private readonly _prisma: PrismaService,
  ) { }

  // get all admins
  async findAll(query: PageOptionsDto): Promise<PageDto<AdminResponse>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'id';

    const order = query.order || 'asc';


    // const data = await this._prisma.admin.findMany({
    //   include: {
    //     roles: true,
    //   },
    //   where: {
    //     OR: [
    //       { email: { contains: search } },
    //       { username: { contains: search } },
    //       { phone: { contains: search } },
    //     ],
    //   },
    //   take: limit,
    //   skip: skip,
    //   orderBy: {
    //     [sort]: order.toUpperCase(),
    //   },
    // });


    const queryData: Prisma.AdminFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
        roles: {
          some: {
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
  async create(createAdminDto: CreateAdminDto) {
    const checkAdmin = await this._prisma.admin.findFirst({
      where: {
        OR: [
          { email: createAdminDto.email },
          { username: createAdminDto.username },
          { phone: createAdminDto.phone },
        ],
      }
    });

    if (checkAdmin) {
      throw new HttpException('Admin already exists ', HttpStatus.BAD_REQUEST);
    }

    const password = await hash(createAdminDto.password, 15);

    const admin = await this._prisma.admin.create({
      data: {
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        email: createAdminDto.email,
        username: createAdminDto.username,
        phone: createAdminDto.phone,
        password: password,
        isActive: createAdminDto.isActive ? true : false,

      },
    });


    // createAdminDto.roles.forEach(async (role) => {
    //   await this._prisma.adminRole.create({
    //     data: {
    //       adminId: admin.id,
    //       roleId: Number(role),
    //     },
    //   });
    // });

    const adminRole = await this._prisma.role.findFirst({
      where: {
        slug: 'superadmin',
      },
    });

    await this._prisma.adminRole.create({
      data: {
        adminId: admin.id,
        roleId: adminRole.id,
      },
    });

    const adminData = await this._prisma.admin.findUnique({
      where: {
        id: admin.id,
      },
      include: {
        roles: true,
      },
    });

    delete adminData.password;

    return {
      data: adminData,
      message: 'Admin Created Successfully',
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
      },
    });

    const roles = await this._prisma.role.findMany({
      where: {
        id: {
          in: admin.roles.map((role) => role.roleId),
        }
      },
      include: {
        permissions: {
          select: {
            permissionId: true,
            permission: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
          }
        },
      },
    });

    const permissions = roles.map((role) => role.permissions.map((permission) => permission.permission));

    const adminPermissions = permissions.flat();

    // unique permissions
    const uniquePermissions = adminPermissions.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

    // keep only slug from permissions
    const slugPermissions = uniquePermissions.map((permission) => permission.slug);

    // sort permissions
    const sortedPermissions = slugPermissions.sort();

    delete admin.password;

    return {
      data: admin,
      permissions: sortedPermissions,
    };

  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
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
          { email: updateAdminDto.email },
          { username: updateAdminDto.username },
          { phone: updateAdminDto.phone },
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
        email: updateAdminDto.email ? updateAdminDto.email : data.email,
        username: updateAdminDto.username ? updateAdminDto.username : data.username,
        phone: updateAdminDto.phone ? updateAdminDto.phone : data.phone,
        isActive: updateAdminDto.isActive ? updateAdminDto.isActive : data.isActive,

      },
    });


    if (updateAdminDto.password) {
      const password = await hash(updateAdminDto.password, 15);

      await this._prisma.admin.update({
        where: {
          id: id,
        },
        data: {
          password: password,
        },
      });
    }



    if (updateAdminDto.roles && updateAdminDto.roles.length > 0) {
      await this._prisma.adminRole.deleteMany({
        where: {
          adminId: id,
        },
      });

      updateAdminDto.roles.forEach(async (role) => {
        await this._prisma.adminRole.create({
          data: {
            adminId: id,
            roleId: role,
          },
        });
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

    console.log(admin)

    if (admin.username == "super_admin") {
      throw new HttpException('Admin Status Cannot be changed', HttpStatus.BAD_REQUEST);
    }


    // delete admin
    const data = await this._prisma.admin.delete({
      where: {
        id: id,
      },

    });

    console.log(data)


    return {
      message: 'Admin deleted successfully',
    };
  }

  async changeStatus(id: number) {
    const admin = await this._prisma.admin.findFirst({
      where: { id },
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }


    if (admin.username == "super_admin") {
      throw new HttpException('Admin Status Cannot be changed', HttpStatus.BAD_REQUEST);
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

  async findByUsername(username: string) {
    return await this._prisma.admin.findFirst({ where: { username } });
  }

  async findByEmail(email: string) {
    return await this._prisma.admin.findFirst({ where: { email } });
  }

  async findOne(id: number) {
    return await this._prisma.admin.findFirst({ where: { id } });
  }

  async findByUsernameOrEmail(username: string) {
    // check if username or email exists


    const admin = await this._prisma.admin.findFirst({
      where: {
        OR: [
          { email: username },
          { username: username },
        ],
      },
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }

    return admin;
  }

  async getPermissions(id: number) {

    const admin = await this._prisma.admin.findFirst({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  }
                },
              }
            },
          },
        },
      },
    });


    const role = await this._prisma.role.findMany({
      where: {
        id: {
          in: admin.roles.map((role) => role.roleId),
        }
      },
      include: {
        permissions: {
          include: {
            permission: true,
          }
        },
      },
    });

    return role;

  }

  // getAllAdmins
  async getAllAdmins() {
    const items = await this._prisma.admin.findMany({
      where: {
        isActive: true,
      },
      include: {
        roles: true,
      },
    });

    return {
      message: 'Items fetched successfully',
      items: items,
    };
  }
}

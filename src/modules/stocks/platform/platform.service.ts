import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { generateSlug } from '@/common/helpers/GenerateHelpers';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class PlatformService {
  constructor(
    private readonly _prisma: PrismaService,

  ) { }

  async findAll(query: PageOptionsDto): Promise<PageDto<Role>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'id';

    const order = query.order || 'asc';



    const queryData: Prisma.RoleFindManyArgs = {
      where: {
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } },
        ],
      },
      // include: {
      //   permissions: {
      //     include: {
      //       permission: true,
      //     }
      //   },
      // },
      take: limit,
      skip: skip,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
    };
    const [items, count] = await this._prisma.$transaction([
      this._prisma.role.findMany(queryData),
      this._prisma.role.count({ where: queryData.where })
    ]);


    // const transformedResult = items.map((item) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   delete item.password;
    //   return item;
    // });

    const pageOptionsDto = {
      limit: limit,
      page: page,
      skip: skip,
    };


    const pageMetaDto = new PageMetaDto({
      total: count,
      pageOptionsDto: pageOptionsDto,
    });


    return new PageDto(items, pageMetaDto);


  }

  async findOne(id: number) {
    return await this._prisma.role.findUnique({
      where: {
        id: id,
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
                group: true,

              },
            },
          },
        },
      },
    });
  }

  async create(createDto: CreateCategoryDto) {
    const check = await this._prisma.platform.findFirst({
      where: {
        OR: [
          { name: createDto.name },
        ],
      },
    });

    if (check) {
      throw new HttpException('platform already exists', HttpStatus.BAD_REQUEST);
    }

    const item = await this._prisma.platform.create({
      data: {
        name: createDto.name,
      },
    });


    return {
      message: 'Item created successfully',
      data: item,

    };
  }

  async update(id: number, updateDto: UpdateCategoryDto) {
    // convert name to slug
    const slug = generateSlug(updateDto.name);

    // update role not working

    const role = await this._prisma.role.findUnique({
      where: {
        id: id,
      },
    });

    if (!role) {
      throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
    }

    const checkRole = await this._prisma.role.findFirst({
      where: {
        NOT: {
          id: id,
        },
        OR: [
          { slug: slug },
          { name: updateDto.name },
        ],
      },
    });

    if (checkRole) {
      throw new HttpException('Role already exists', HttpStatus.BAD_REQUEST);
    }


    await this._prisma.role.update({
      where: {
        id: id,
      },
      data: {
        name: updateDto.name,
        slug: slug,

      },
    });


    // delete all permissions
    await this._prisma.permissionRole.deleteMany({
      where: {
        roleId: id,
      },
    });


    const roleData = await this._prisma.role.findUnique({
      where: {
        id: id,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return {
      message: 'Role Updated successfully',
      data: roleData,
      permissions: roleData.permissions,
    };
  }

  async remove(id: number) {

    const role = await this._prisma.role.findUnique({
      where: {
        id: id,
      },
      include: {
        admins: true,
      },
    });

    if (!role) {
      throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
    }


    if (role.admins.length > 0) {
      throw new HttpException('Role is in use it cannot be deleted', HttpStatus.BAD_REQUEST);
    }




    // superadmin role cannot be deleted
    if (role.slug === 'superadmin' || role.slug === 'admin') {
      throw new HttpException(
        'Superadmin cannot be deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    // delete all permissions
    await this._prisma.permissionRole.deleteMany({
      where: {
        roleId: id,
      },
    });

    // delete role
    await this._prisma.role.delete({
      where: {
        id: id,
      },
    });



    return {
      message: 'Role deleted successfully',
      data: role,
    };
  }

  async changeStatus(id: number) {

    const role = await this._prisma.platform.findUnique({
      where: {
        id: id,
      },
    });

    if (!role) {
      throw new HttpException('Item not found', HttpStatus.BAD_REQUEST);
    }

    await this._prisma.platform.update({
      where: {
        id: id,
      },
      data: {
        isActive: !role.isActive,
      },
    });

    return {
      message: 'Status Changed successfully',
    };
  }

  // getAllItems
  async getAllItems() {
    const items = await this._prisma.platform.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return {
      message: 'Items fetched successfully',
      items: items,
    };
  }
}

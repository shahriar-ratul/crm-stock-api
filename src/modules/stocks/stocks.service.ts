import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common/dto';
import { Prisma, Stock } from '@prisma/client';
import { getImageUrl } from '@/common/helpers/GenerateHelpers';

@Injectable()
export class StocksService {

  constructor(
    private readonly _prisma: PrismaService,
  ) { }

  // add 
  async create(
    createDto: CreateStockDto,
    files: Array<Express.Multer.File>,
    image: Express.Multer.File,
    user: number
  ) {


    const item = await this._prisma.stock.create({
      data: {
        entryDate: createDto.entryDate,
        batch: createDto.batch,
        stockID: createDto.productId,
        qty: Number(createDto.qty),
        costPerUnit: Number(createDto.costPerUnit),
        localShippingCost: Number(createDto.localShippingCost),
        internationalShippingCost: Number(createDto.internationalShippingCost),
        customsTax: Number(createDto.customsTax),
        salePrice: Number(createDto.salePrice),
        marketPrice: Number(createDto.marketPrice),
        partnerPrice: Number(createDto.partnerPrice),
        trackingStatus: createDto.trackingStatus,
        trackingNumberLocal: createDto.trackingNumberLocal,
        trackingNumberInternational: createDto.trackingNumberInternational,
        email: createDto.email,
        category: {
          connect: {
            id: Number(createDto.category)
          }
        },
        source: {
          connect: {
            id: Number(createDto.source)
          }
        },
        route: {
          connect: {
            id: Number(createDto.route)
          }
        },
        currentStock: Number(createDto.qty),
        name: createDto.name,
        admin: {
          connect: {
            id: user
          }
        },
        imageCover: image ? image.path : null,
      }
    })

    if (files && files.length > 0) {

      files.map(async (file) => {
        await this._prisma.stockImages.create({
          data: {
            stockID: item.id,
            path: file.path,
            size: file.size,
            type: file.mimetype,
            url: file.path
          },
        })
      });
    }

    const platforms = createDto.platforms || [];

    if (platforms.length > 0) {
      platforms.map(async (platform) => {
        await this._prisma.stockPlatform.create({
          data: {
            stockID: item.id,
            platformID: platform
          }
        })
      })
    }

    return {
      data: item,
      message: 'Created Successfully',
    };
  }

  async findAll(query: PageOptionsDto): Promise<PageDto<Stock>> {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const skip: number = (page - 1) * limit;
    const search = query.search || '';

    const sort = query.sort || 'id';

    const order = query.order || 'asc';

    let isActive = undefined;

    if (query.isActive === 'true') {
      isActive = true;
    } else if (query.isActive === 'false') {
      isActive = false;
    }



    const queryData: Prisma.StockFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },

        ],
        isActive: isActive,
      },
      include: {
        category: true,
        images: true,
        route: true,
        source: true,

      },

      take: limit,
      skip: skip,
      orderBy: {
        [sort]: order.toLowerCase(),
      },
    };
    const [items, count] = await this._prisma.$transaction([
      this._prisma.stock.findMany(queryData),
      this._prisma.stock.count({ where: queryData.where })
    ]);


    const transformedResult = items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async findOne(id: number) {
    const item = await this._prisma.stock.findUnique({
      where: {
        id: id,
      },
      include: {
        admin: true,
        category: true,
        platforms: {
          include: {
            platform: true
          }
        },
        images: true,
        route: true,
        source: true,
      }
    });

    // convert photo to url
    if (item.imageCover) {
      item.imageCover = getImageUrl(item.imageCover);
    }

    if (item.images) {
      item.images = item.images.map((image) => {
        image.url = getImageUrl(image.url);
        image.path = getImageUrl(image.path);
        return image;
      })
    }

    return {
      item: item,
    };

  }


  async update(
    id: number,
    updateDto: UpdateStockDto,
    files: Array<Express.Multer.File>,
    image: Express.Multer.File,
    user: number
  ) {

    const data = await this._prisma.stock.findFirst({
      where: {
        id: id,
      },
    });

    if (!data) {
      throw new HttpException('Item Not Found ', HttpStatus.BAD_REQUEST);
    }


    const item = await this._prisma.stock.update({
      where: {
        id: id,
      },
      data: {
        entryDate: updateDto.entryDate,
        batch: updateDto.batch,
        stockID: updateDto.productId,
        qty: Number(updateDto.qty),
        costPerUnit: Number(updateDto.costPerUnit),
        localShippingCost: Number(updateDto.localShippingCost),
        internationalShippingCost: Number(updateDto.internationalShippingCost),
        customsTax: Number(updateDto.customsTax),
        salePrice: Number(updateDto.salePrice),
        marketPrice: Number(updateDto.marketPrice),
        partnerPrice: Number(updateDto.partnerPrice),
        trackingStatus: updateDto.trackingStatus,
        trackingNumberLocal: updateDto.trackingNumberLocal,
        trackingNumberInternational: updateDto.trackingNumberInternational,
        email: updateDto.email,
        category: {
          connect: {
            id: Number(updateDto.category)
          }
        },
        source: {
          connect: {
            id: Number(updateDto.source)
          }
        },
        route: {
          connect: {
            id: Number(updateDto.route)
          }
        },
        currentStock: Number(updateDto.qty),
        name: updateDto.name,
        admin: {
          connect: {
            id: user
          }
        },
        imageCover: image ? image.path : data.imageCover,
      }
    })

    if (files && files.length > 0) {

      files.map(async (file) => {
        await this._prisma.stockImages.create({
          data: {
            stockID: item.id,
            path: file.path,
            size: file.size,
            type: file.mimetype,
            url: file.path
          },
        })
      });
    }

    const platforms = updateDto.platforms || [];

    if (platforms.length > 0) {

      await this._prisma.stockPlatform.deleteMany({
        where: {
          stockID: item.id
        }
      })


      platforms.map(async (platform) => {
        await this._prisma.stockPlatform.create({
          data: {
            stockID: item.id,
            platformID: platform
          }
        })
      })
    }

    return {
      data: item,
      message: 'Item Updated Successfully',
    };
  }

  async remove(id: number) {

    const item = await this._prisma.stock.findFirst({
      where: { id },
    });

    if (!item) {
      throw new HttpException('item not found', HttpStatus.BAD_REQUEST);
    }

    // delete
    const data = await this._prisma.stock.delete({
      where: {
        id: id,
      },
    });


    return {
      data: data,
      message: 'item deleted successfully',
    };
  }

  async changeStatus(id: number) {
    const item = await this._prisma.stock.findFirst({
      where: { id },
    });

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.BAD_REQUEST);
    }

    await this._prisma.stock.update({
      where: {
        id: id,
      },
      data: {
        isActive: !item.isActive,
      },
    });

    return {
      message: 'Status Changed successfully',
    };
  }

}

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


    const queryData: Prisma.StockFindManyArgs = {
      where: {
        OR: [
          { email: { contains: search } },

        ]
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
    });

    // convert photo to url
    if (item.imageCover) {
      item.imageCover = getImageUrl(item.imageCover);
    }

    return {
      item: item,
    };

  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    console.log(updateStockDto);

    return `This action updates a #${id} stock`;
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

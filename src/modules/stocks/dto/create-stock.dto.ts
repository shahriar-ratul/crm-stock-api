import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class CreateStockDto {
    // entryDate
    @ApiProperty({
        type: 'string',
        example: '2022-12-12',
        description: 'entryDate',
    })
    @Transform(({ value }) => (value ? JSON.parse(value) : null))
    @IsNotEmpty()
    entryDate: Date;

    @ApiProperty({
        type: 'batch',
        example: 'string',
        description: 'batch',
    })
    @IsNotEmpty()
    batch: string;

    // productId
    @ApiProperty({
        type: 'string',
        example: 'phone',
        description: 'productId',
    })
    @IsNotEmpty()
    productId: string;

    // category
    @ApiProperty({
        type: 'number',
        example: 'category',
        description: 'category',
    })
    @IsNotEmpty()
    category: number;

    // source
    @ApiProperty({
        type: 'string',
        example: 'source',
        description: 'source',
    })
    @IsNotEmpty()
    source: string;


    // qty
    @ApiProperty({
        type: 'string',
        example: 'qty',
        description: 'qty',
    })
    @IsNotEmpty()
    qty: string;

    // costPerUnit
    @ApiProperty({
        type: 'string',
        example: 'costPerUnit',
        description: 'costPerUnit',
    })
    @IsNotEmpty()
    costPerUnit: string;


    // localShippingCost
    @ApiProperty({
        type: 'string',
        example: 'localShippingCost',
        description: 'localShippingCost',
    })
    @IsNotEmpty()
    localShippingCost: string;

    // internationalShippingCost
    @ApiProperty({
        type: 'string',
        example: 'internationalShippingCost',
        description: 'internationalShippingCost',
    })
    @IsNotEmpty()
    internationalShippingCost: string;


    // customsTax
    @ApiProperty({
        type: 'string',
        example: 'customsTax',
        description: 'customsTax',
    })
    @IsNotEmpty()
    customsTax: string;



    // salePrice
    @ApiProperty({
        type: 'string',
        example: 'salePrice',
        description: 'salePrice',
    })
    @IsNotEmpty()
    salePrice: string;

    // marketPrice
    @ApiProperty({
        type: 'string',
        example: 'marketPrice',
        description: 'marketPrice',
    })
    @IsNotEmpty()
    marketPrice: string;

    // partnerPrice
    @ApiProperty({
        type: 'string',
        example: 'partnerPrice',
        description: 'partnerPrice',
    })
    @IsNotEmpty()
    partnerPrice: string;



    // route
    @ApiProperty({
        type: 'string',
        example: 'route',
        description: 'route',
    })
    @IsNotEmpty()
    route: string;


    // trackingStatus
    @ApiProperty({
        type: 'string',
        example: 'trackingStatus',
        description: 'trackingStatus',
    })
    @IsNotEmpty()
    trackingStatus: string;



    // trackingNumberLocal
    @ApiProperty({
        type: 'string',
        example: 'trackingNumberLocal',
        description: 'trackingNumberLocal',
    })
    @IsNotEmpty()
    trackingNumberLocal: string;



    // trackingNumberInternational
    @ApiProperty({
        type: 'string',
        example: 'trackingNumberInternational',
        description: 'trackingNumberInternational',
    })
    @IsNotEmpty()
    trackingNumberInternational: string;



    // email
    @ApiProperty({
        type: 'string',
        example: 'email',
        description: 'email',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;


    // name
    @ApiProperty({
        type: 'string',
        example: 'name',
        description: 'name',
    })
    @IsNotEmpty()
    name: string;


    // isActive
    @ApiProperty({
        type: 'string',
        example: 'isActive',
        description: 'isActive',
    })
    @IsNotEmpty()
    isActive: string;



    // platform json
    @ApiProperty({
        type: 'array',
        example: 'platforms',
        description: 'platform json',
    })
    @IsOptional()
    @Transform(({ value }) => (value ? JSON.parse(value) : []))
    platforms: number[];

}



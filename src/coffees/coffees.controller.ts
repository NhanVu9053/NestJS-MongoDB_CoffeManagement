import { Body, Controller, Get, Param, Post, Patch, Delete,Query } from '@nestjs/common';
import { query } from 'express';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
    constructor(private readonly coffeesService: CoffeesService){

    }

    @Get()
    findAll(@Query() paginationquery: PaginationQueryDto){
    //  const {limit, offset } = paginationquery;
     return this.coffeesService.findAll(paginationquery);
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.coffeesService.findOne(id);
    }

    @Post()   
    Create(@Body() createCoffeeDto: CreateCoffeeDto){
        //this return new coffee
        return this.coffeesService.create(createCoffeeDto);
    }

    @Patch(':id')
    Update(@Param('id') id: string,@Body() updateCoffeeDto: UpdateCoffeeDto){
        return this.coffeesService.update(id, updateCoffeeDto);
    }

    @Delete(':id')
    Remove(@Param('id') id: string){
        return this.coffeesService.remove(id);
    }
}


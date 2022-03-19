import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Coffee } from './entities/coffees.entity';
import { Model, Connection } from 'mongoose';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class CoffeesService {
    constructor(
        @InjectModel(Coffee.name)
        private readonly coffeeModel: Model<Coffee>,

        @InjectConnection()
        private readonly connection: Connection,

        @InjectModel(Event.name)
        private readonly eventModel: Model<Event>,
        
      ) {}

    findAll(paginationquery: PaginationQueryDto){
        const {limit, offset} = paginationquery; 
        return this.coffeeModel.find()
        .skip(offset)
        .limit(limit)
        .exec();
    }

    async findOne(id: string){
       const coffee = await this.coffeeModel.findOne({_id: id}).exec();
       if(!coffee){
           throw new HttpException(`coffee ${id} not found`,HttpStatus.NOT_FOUND);
       }
       return coffee;
        
    }

    create(createCoffeeDto: CreateCoffeeDto){
        const coffee = new this.coffeeModel(CreateCoffeeDto);
        return coffee.save();
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto){
        const existingCoffee = await this.coffeeModel.findByIdAndUpdate(
            {_id:id },
             {$set: updateCoffeeDto},
              {new: true}).exec();
        if(!existingCoffee){
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return existingCoffee;
    }

   async remove(id: string){
    const coffee = await this.findOne(id);
    return coffee.remove();
    }

    async recommendCoffee(coffee: Coffee) {
        const session = await this.connection.startSession();
        session.startTransaction();
    
        try {
          coffee.recommendations++;
    
          const recommendEvent = new this.eventModel({
            name: 'recommend_coffee',
            type: 'coffee',
            payload: { coffeeId: coffee.id },
          });
          await recommendEvent.save({ session });
          await coffee.save({ session });
    
          await session.commitTransaction();
        } catch (err) {
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      }
}


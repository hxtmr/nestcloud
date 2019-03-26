import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Validator } from 'class-validator';

@Injectable()
export class Max implements PipeTransform<any> {
  private readonly max: number;
  private readonly message: string;
  private validator: Validator;

  constructor(max: number, message?: string) {
    this.message = message || '';
    this.validator = new Validator();
    this.max = max;
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!this.validator.max(value, this.max)) {
      const { data } = metadata;
      const defaults = data ? `${data} is not valid` : 'Validation failed';
      throw new BadRequestException(this.message || defaults);
    }
    return value;
  }
}

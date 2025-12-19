import { Global, Module } from '@nestjs/common';
import { KratosService } from './kratos.service';

@Global()
@Module({
    providers: [KratosService],
    exports: [KratosService],
})
export class KratosModule { }

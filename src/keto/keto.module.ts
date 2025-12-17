import { Module, Global } from '@nestjs/common';
import { KetoService } from './keto.service';

/**
 * KetoModule - Global module for Ory Keto integration
 * 
 * CONCEPT: Centralized Authorization Service
 * This module provides a single point of integration with Ory Keto.
 * All permission checks and relation management go through KetoService.
 * 
 * Making it @Global() means we don't need to import it everywhere.
 */
@Global()
@Module({
    providers: [KetoService],
    exports: [KetoService],
})
export class KetoModule { }

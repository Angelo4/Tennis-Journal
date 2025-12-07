/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { StringType } from './StringType';
export type CreateTennisStringRequest = {
    brand?: string | null;
    model?: string | null;
    gauge?: string | null;
    type?: StringType;
    mainTension?: number | null;
    crossTension?: number | null;
    dateStrung?: string;
    isActive?: boolean;
    notes?: string | null;
};


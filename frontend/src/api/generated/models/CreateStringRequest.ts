/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StringType } from './StringType';
import type { StringStatus } from './StringStatus';
export type CreateStringRequest = {
    brand: string;
    model: string;
    gauge?: string | null;
    type?: StringType;
    mainTension?: number | null;
    crossTension?: number | null;
    dateStrung?: string | null;
    status?: StringStatus;
    notes?: string | null;
};


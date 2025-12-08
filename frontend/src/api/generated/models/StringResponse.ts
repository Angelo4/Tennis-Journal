/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StringType } from './StringType';
import type { StringStatus } from './StringStatus';
export type StringResponse = {
    id?: string | null;
    brand?: string | null;
    model?: string | null;
    gauge?: string | null;
    type?: StringType;
    mainTension?: number | null;
    crossTension?: number | null;
    dateStrung?: string | null;
    dateRemoved?: string | null;
    status?: StringStatus;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
};


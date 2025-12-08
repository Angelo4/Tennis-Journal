/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StringType } from './StringType';
import type { StringStatus } from './StringStatus';
export type UpdateStringRequest = {
    brand?: string | null;
    model?: string | null;
    gauge?: string | null;
    type?: StringType | null;
    mainTension?: number | null;
    crossTension?: number | null;
    dateStrung?: string | null;
    dateRemoved?: string | null;
    status?: StringStatus | null;
    notes?: string | null;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStringRequest } from '../models/CreateStringRequest';
import type { StringResponse } from '../models/StringResponse';
import type { StringUsageStatsResponse } from '../models/StringUsageStatsResponse';
import type { UpdateStringRequest } from '../models/UpdateStringRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StringsService {
    /**
     * @param isActive
     * @returns StringResponse Success
     * @throws ApiError
     */
    public static getApiStrings(
        isActive?: boolean,
    ): CancelablePromise<Array<StringResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Strings',
            query: {
                'isActive': isActive,
            },
        });
    }
    /**
     * @param requestBody
     * @returns StringResponse Created
     * @throws ApiError
     */
    public static postApiStrings(
        requestBody?: CreateStringRequest,
    ): CancelablePromise<StringResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Strings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param id
     * @returns StringResponse Success
     * @throws ApiError
     */
    public static getApiStrings1(
        id: string,
    ): CancelablePromise<StringResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Strings/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns StringResponse Success
     * @throws ApiError
     */
    public static putApiStrings(
        id: string,
        requestBody?: UpdateStringRequest,
    ): CancelablePromise<StringResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/Strings/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteApiStrings(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Strings/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @returns StringUsageStatsResponse Success
     * @throws ApiError
     */
    public static getApiStringsUsage(
        id: string,
    ): CancelablePromise<StringUsageStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Strings/{id}/usage',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @returns StringResponse Success
     * @throws ApiError
     */
    public static postApiStringsRemove(
        id: string,
    ): CancelablePromise<StringResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Strings/{id}/remove',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @returns StringResponse Success
     * @throws ApiError
     */
    public static postApiStringsRestore(
        id: string,
    ): CancelablePromise<StringResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Strings/{id}/restore',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
}

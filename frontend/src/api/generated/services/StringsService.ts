/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { CreateTennisStringRequest } from '../models/CreateTennisStringRequest';
import type { StringUsageStats } from '../models/StringUsageStats';
import type { TennisString } from '../models/TennisString';
import type { UpdateTennisStringRequest } from '../models/UpdateTennisStringRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StringsService {
    /**
     * @param isActive
     * @returns TennisString Success
     * @throws ApiError
     */
    public static getApiStrings(
        isActive?: boolean,
    ): CancelablePromise<Array<TennisString>> {
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
     * @returns TennisString Created
     * @throws ApiError
     */
    public static postApiStrings(
        requestBody?: CreateTennisStringRequest,
    ): CancelablePromise<TennisString> {
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
     * @returns TennisString Success
     * @throws ApiError
     */
    public static getApiStrings1(
        id: string,
    ): CancelablePromise<TennisString> {
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
     * @returns TennisString Success
     * @throws ApiError
     */
    public static putApiStrings(
        id: string,
        requestBody?: UpdateTennisStringRequest,
    ): CancelablePromise<TennisString> {
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
     * @returns StringUsageStats Success
     * @throws ApiError
     */
    public static getApiStringsUsage(
        id: string,
    ): CancelablePromise<StringUsageStats> {
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
     * @returns TennisString Success
     * @throws ApiError
     */
    public static postApiStringsRemove(
        id: string,
    ): CancelablePromise<TennisString> {
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
     * @returns TennisString Success
     * @throws ApiError
     */
    public static postApiStringsRestore(
        id: string,
    ): CancelablePromise<TennisString> {
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

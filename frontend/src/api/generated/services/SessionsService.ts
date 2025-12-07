/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { CreateTennisSessionRequest } from '../models/CreateTennisSessionRequest';
import type { TennisSession } from '../models/TennisSession';
import type { TennisSessionWithString } from '../models/TennisSessionWithString';
import type { UpdateTennisSessionRequest } from '../models/UpdateTennisSessionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SessionsService {
    /**
     * @returns TennisSession Success
     * @throws ApiError
     */
    public static getApiSessions(): CancelablePromise<Array<TennisSession>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Sessions',
        });
    }
    /**
     * @param requestBody
     * @returns TennisSession Created
     * @throws ApiError
     */
    public static postApiSessions(
        requestBody?: CreateTennisSessionRequest,
    ): CancelablePromise<TennisSession> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Sessions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param id
     * @returns TennisSession Success
     * @throws ApiError
     */
    public static getApiSessions1(
        id: string,
    ): CancelablePromise<TennisSession> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Sessions/{id}',
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
     * @returns TennisSession Success
     * @throws ApiError
     */
    public static putApiSessions(
        id: string,
        requestBody?: UpdateTennisSessionRequest,
    ): CancelablePromise<TennisSession> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/Sessions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteApiSessions(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Sessions/{id}',
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
     * @returns TennisSessionWithString Success
     * @throws ApiError
     */
    public static getApiSessionsWithString(
        id: string,
    ): CancelablePromise<TennisSessionWithString> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Sessions/{id}/with-string',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
}

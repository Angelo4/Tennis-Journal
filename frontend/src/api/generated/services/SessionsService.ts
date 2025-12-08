/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSessionRequest } from '../models/CreateSessionRequest';
import type { SessionResponse } from '../models/SessionResponse';
import type { SessionWithStringResponse } from '../models/SessionWithStringResponse';
import type { UpdateSessionRequest } from '../models/UpdateSessionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SessionsService {
    /**
     * @returns SessionResponse Success
     * @throws ApiError
     */
    public static getApiSessions(): CancelablePromise<Array<SessionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Sessions',
        });
    }
    /**
     * @param requestBody
     * @returns SessionResponse Created
     * @throws ApiError
     */
    public static postApiSessions(
        requestBody?: CreateSessionRequest,
    ): CancelablePromise<SessionResponse> {
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
     * @returns SessionResponse Success
     * @throws ApiError
     */
    public static getApiSessions1(
        id: string,
    ): CancelablePromise<SessionResponse> {
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
     * @returns SessionResponse Success
     * @throws ApiError
     */
    public static putApiSessions(
        id: string,
        requestBody?: UpdateSessionRequest,
    ): CancelablePromise<SessionResponse> {
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
     * @returns SessionWithStringResponse Success
     * @throws ApiError
     */
    public static getApiSessionsWithString(
        id: string,
    ): CancelablePromise<SessionWithStringResponse> {
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

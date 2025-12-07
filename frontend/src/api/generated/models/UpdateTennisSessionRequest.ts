/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { CourtSurface } from './CourtSurface';
import type { SessionType } from './SessionType';
export type UpdateTennisSessionRequest = {
    sessionDate?: string | null;
    type?: SessionType;
    durationMinutes?: number | null;
    location?: string | null;
    surface?: CourtSurface;
    stringId?: string | null;
    stringFeelingRating?: number | null;
    stringNotes?: string | null;
    notes?: string | null;
};


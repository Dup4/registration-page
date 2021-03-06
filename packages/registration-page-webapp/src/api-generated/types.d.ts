// This file is generated automatically, do NOT modify it.

declare namespace ApiTypes {
    export interface AddOrganizationRequestDto {
        organizationName: string;
    }
    export interface AddOrganizationResponseDto {
        error?: "PERMISSION_DENIED";
    }
    export interface ApproveRequestDto {
        registrationId: number;
        approveState: "Pending" | "Rejected" | "Accepted";
    }
    export interface ApproveResponseDto {
        error?: "PERMISSION_DENIED" | "NO_SUCH_REGISTRATION_ID" | "STATE_UNCHANGED";
    }
    export interface GetOrganizationListResponseDto {
        registrationMetaList: ApiTypes.RegistrationOrganizationEntity[];
    }
    export interface GetRegistrationListRequestDto {
        approveState?: "Pending" | "Rejected" | "Accepted";
    }
    export interface GetRegistrationListResponseDto {
        error?: "PERMISSION_DENIED";
        registrationMetaList?: ApiTypes.RegistrationMetaDto[];
    }
    export interface GetRegistrationResponseDto {
        error?: "PERMISSION_DENIED" | "NO_SUCH_REGISTRATION";
        registrationMeta?: ApiTypes.RegistrationMetaDto;
    }
    export interface GetSessionInfoResponseDto {
        userMeta?: ApiTypes.UserMetaDto;
    }
    export interface GetVersionDto {
        version: string;
    }
    export interface LoginRequestDto {
        email: string;
        emailVerificationCode?: string;
    }
    export interface LoginResponseDto {
        error?: "ALREADY_LOGGEDIN" | "DUPLICATE_USERNAME" | "DUPLICATE_EMAIL" | "INVALID_EMAIL_VERIFICATION_CODE";
        token?: string;
        userMeta?: ApiTypes.UserMetaDto;
    }
    namespace Parameters {
        export type Jsonp = boolean;
        export type Token = string;
    }
    export interface QueryParameters {
        token?: ApiTypes.Parameters.Token;
        jsonp?: ApiTypes.Parameters.Jsonp;
    }
    export interface RegistrationMetaDto {
        email: string;
        name: string;
        id: string;
        organizationId: number;
        organizationName: string;
        approveState: "Pending" | "Rejected" | "Accepted";
    }
    export interface RegistrationOrganizationEntity {
        id: number;
        organizationName: string;
    }
    export interface RegistrationRequestDto {
        organizationId: number;
        name: string;
        id: string;
    }
    export interface RegistrationResponseDto {
        error?: "PERMISSION_DENIED" | "NO_SUCH_ORGANIZATION";
    }
    export type RequestBody = ApiTypes.AddOrganizationRequestDto;
    namespace Responses {
        export type $200 = ApiTypes.GetRegistrationListResponseDto;
        export type $201 = ApiTypes.GetOrganizationListResponseDto;
    }
    export interface SendEmailVerificationCodeRequestDto {
        email: string;
        type: "Login";
        locale: "en_US";
    }
    export interface SendEmailVerificationCodeResponseDto {
        error?: "PERMISSION_DENIED" | "ALREADY_LOGGEDIN" | "FAILED_TO_SEND" | "RATE_LIMITED";
        errorMessage?: string;
    }
    export interface UserMetaDto {
        id: number;
        email: string;
        isAdmin: boolean;
    }
}

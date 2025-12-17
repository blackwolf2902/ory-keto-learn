export declare const PERMISSION_METADATA_KEY = "keto:permission";
export declare const SKIP_PERMISSION_CHECK_KEY = "keto:skip";
export interface PermissionRequirement {
    namespace: string;
    relation: string;
    objectIdSource?: 'params' | 'body' | 'custom';
    objectIdParam?: string;
}
export declare function RequirePermission(requirement: PermissionRequirement): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function SkipPermissionCheck(): import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSION_ANY_METADATA_KEY = "keto:permission:any";
export declare function RequireAnyPermission(requirements: PermissionRequirement[]): import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSION_ALL_METADATA_KEY = "keto:permission:all";
export declare function RequireAllPermissions(requirements: PermissionRequirement[]): import("@nestjs/common").CustomDecorator<string>;

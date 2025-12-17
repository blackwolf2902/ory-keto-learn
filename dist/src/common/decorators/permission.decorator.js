"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_ALL_METADATA_KEY = exports.PERMISSION_ANY_METADATA_KEY = exports.SKIP_PERMISSION_CHECK_KEY = exports.PERMISSION_METADATA_KEY = void 0;
exports.RequirePermission = RequirePermission;
exports.SkipPermissionCheck = SkipPermissionCheck;
exports.RequireAnyPermission = RequireAnyPermission;
exports.RequireAllPermissions = RequireAllPermissions;
const common_1 = require("@nestjs/common");
exports.PERMISSION_METADATA_KEY = 'keto:permission';
exports.SKIP_PERMISSION_CHECK_KEY = 'keto:skip';
function RequirePermission(requirement) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.PERMISSION_METADATA_KEY, requirement));
}
function SkipPermissionCheck() {
    return (0, common_1.SetMetadata)(exports.SKIP_PERMISSION_CHECK_KEY, true);
}
exports.PERMISSION_ANY_METADATA_KEY = 'keto:permission:any';
function RequireAnyPermission(requirements) {
    return (0, common_1.SetMetadata)(exports.PERMISSION_ANY_METADATA_KEY, requirements);
}
exports.PERMISSION_ALL_METADATA_KEY = 'keto:permission:all';
function RequireAllPermissions(requirements) {
    return (0, common_1.SetMetadata)(exports.PERMISSION_ALL_METADATA_KEY, requirements);
}
//# sourceMappingURL=permission.decorator.js.map
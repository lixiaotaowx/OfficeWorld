export async function waitForScreenPermission(room: Room, valid: () => boolean) {\
export async function waitForScreenPermission(room: Room, valid: () => boolean, audio = false) {\
        permission.canPublishSources.includes(3))) return;\
        permission.canPublishSources.includes(3) && (!audio || permission.canPublishSources.includes(4)))) return;\

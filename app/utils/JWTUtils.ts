interface IJwt {
  permissions?: {
    [name: string]: number;
  };
}

/**
 * Parse a jwt into a json object
 */
export function parseJwt(token: string): IJwt {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

/**
 * Check wether permissions are valid
 */
export function hasValidPermissions(token: string, permissions: Array<string>): boolean {
  try {
    const now = Date.now() / 1000;
    const jwt = parseJwt(token);
    const jwtPermissions = jwt.permissions;
    if (permissions.length === 0) return true;
    if (!jwtPermissions) return false;
    let valid = true;
    permissions.forEach(p => {
      if (!jwtPermissions[p] || jwtPermissions[p] < now) {
        valid = false;
      }
    });
    return valid;
  } catch {
    return false;
  }
}

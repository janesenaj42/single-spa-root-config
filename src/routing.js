function matchesPattern(pattern, pathname) {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length < patternSegments.length) return false;
  return patternSegments.every((segment, i) => segment.startsWith(':') || segment === pathSegments[i]);
}

export function matchesActiveWhen(activeWhen, pathname) {
  const patterns = Array.isArray(activeWhen) ? activeWhen : [activeWhen];
  return patterns.some((pattern) => matchesPattern(pattern, pathname));
}

/**
 * Decides whether an MFE should be active for a given URL + auth state.
 * Route matching and the public/role check are independent: a route
 * mismatch always wins, regardless of auth.
 */
export function isAppActive(app, pathname, authState) {
  if (!matchesActiveWhen(app.activeWhen, pathname)) return false;
  if (app.public) return true;
  return authState.isAuthenticated() && authState.hasAnyRole(app.requiredRoles);
}

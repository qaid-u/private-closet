import { NETWORK_REGISTRY, NetworkPermissionId } from './registry';
import { usePrivacyStore } from '../stores/privacyStore';

export class NetworkPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkPermissionError';
  }
}

/**
 * The ONLY authorized gateway for external network requests in Private Closet.
 * Any invocation outside of this module is blocked by ESLint and strict CSP.
 */
export async function guardedFetch(
  permissionId: NetworkPermissionId,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const perm = NETWORK_REGISTRY[permissionId];

  if (!perm) {
    usePrivacyStore.getState().recordAudit({
      permissionId: 'UNKNOWN',
      url,
      status: 'blocked',
      reason: `Unauthorized destination id: ${permissionId}`,
    });
    throw new NetworkPermissionError(
      `Network request rejected: "${permissionId}" is not registered in the Privacy Registry.`
    );
  }

  // Ensure destination URL matches the registered origin
  try {
    const parsedUrl = new URL(url);
    const parsedDestination = new URL(perm.destination);
    if (parsedUrl.origin !== parsedDestination.origin) {
      usePrivacyStore.getState().recordAudit({
        permissionId,
        url,
        status: 'blocked',
        reason: `URL origin ${parsedUrl.origin} does not match registered destination ${parsedDestination.origin}`,
      });
      throw new NetworkPermissionError(
        `Destination origin mismatch. Registered: ${perm.destination}, requested: ${url}`
      );
    }
  } catch (err) {
    if (err instanceof NetworkPermissionError) throw err;
    usePrivacyStore.getState().recordAudit({
      permissionId,
      url,
      status: 'blocked',
      reason: 'Invalid URL format',
    });
    throw new NetworkPermissionError(`Invalid URL provided: ${url}`);
  }

  const isEnabled = usePrivacyStore.getState().isPermissionEnabled(permissionId);
  if (!isEnabled) {
    usePrivacyStore.getState().recordAudit({
      permissionId,
      url,
      status: 'blocked',
      reason: `Permission ${perm.name} is currently disabled in Privacy Center.`,
    });
    throw new NetworkPermissionError(
      `Network access to ${perm.name} is disabled. You can enable it in the Privacy Center.`
    );
  }

  // Record allowed request in audit ledger
  usePrivacyStore.getState().recordAudit({
    permissionId,
    url,
    status: 'allowed',
  });

  // ESLint allows direct window.fetch inside this file only
  return window.fetch(url, options);
}

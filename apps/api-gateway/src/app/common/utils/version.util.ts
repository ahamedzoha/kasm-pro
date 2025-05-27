export class VersionUtil {
  /**
   * Extract version from API path
   * @param path - API path like /api/v1/users
   * @returns version string like 'v1' or null if not found
   */
  static extractVersion(path: string): string | null {
    const match = path.match(/\/api\/(v\d+)\//);
    return match ? match[1] : null;
  }

  /**
   * Check if version is supported
   * @param version - Version string like 'v1'
   * @param supportedVersions - Array of supported versions
   */
  static isVersionSupported(
    version: string,
    supportedVersions: string[]
  ): boolean {
    return supportedVersions.includes(version);
  }

  /**
   * Get latest version from supported versions
   * @param supportedVersions - Array of supported versions
   */
  static getLatestVersion(supportedVersions: string[]): string {
    const sortedVersions = supportedVersions
      .map((v) => ({ version: v, number: parseInt(v.replace("v", "")) }))
      .sort((a, b) => b.number - a.number);

    return sortedVersions[0]?.version || "v1";
  }

  /**
   * Compare two versions
   * @param version1 - First version like 'v1'
   * @param version2 - Second version like 'v2'
   * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  static compareVersions(version1: string, version2: string): number {
    const num1 = parseInt(version1.replace("v", ""));
    const num2 = parseInt(version2.replace("v", ""));

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
    return 0;
  }

  /**
   * Generate version response headers
   * @param currentVersion - Current API version being used
   * @param supportedVersions - All supported versions
   */
  static getVersionHeaders(
    currentVersion: string,
    supportedVersions: string[]
  ): Record<string, string> {
    return {
      "X-API-Version": currentVersion,
      "X-API-Supported-Versions": supportedVersions.join(", "),
      "X-API-Latest-Version": this.getLatestVersion(supportedVersions),
    };
  }
}

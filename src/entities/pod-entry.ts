/**
 * Represents a resource in a pod. Can be both a
 * file or a directory
 */
export type PodEntry = {
  url: string; // The full URL of the resource
  subDir?: string; // Subdirectory from within app/data/
  name: string;
  isDirectory: boolean;
  type: string; // The type of the resource (e.g. text/turtle)
  lastModified: Date;
  modifiedBy: string;
  size: number;
};

export interface VersionMeta {
  version: number;
  label: string;
  subtitle: string;
  features: string[];
}

export const CURRENT_VERSION = 2;

export const VERSION_REGISTRY: VersionMeta[] = [
  {
    version: 1,
    label: 'EP 1',
    subtitle: 'The Lab',
    features: ['ConnectionMap', 'ChadWidget', 'ChadChatOverlay', 'MasterWorkspace'],
  },
  {
    version: 2,
    label: 'EP 2',
    subtitle: 'First Agents',
    features: ['IrisWorkspace', 'ArchitectWorkspace', 'ForgeWorkspace', 'OpticsOverlay', 'ActivityFeed'],
  },
];

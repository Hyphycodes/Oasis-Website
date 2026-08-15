/**
 * The permission matrix.
 *
 * Pure and dependency-free so it can be unit-tested exhaustively — the tests in
 * permissions.test.ts assert every capability for every role, which is the only
 * way a matrix like this stays correct as capabilities are added.
 *
 * The database enum has shipped since 0001 as owner/admin/editor. The brief names
 * the same three Owner/Manager/Contributor. Renaming the enum would rewrite every
 * policy and every existing row for no behavioural gain, so the stored value stays
 * and the label is presentation.
 */

export type Role = 'owner' | 'admin' | 'editor';

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Manager',
  editor: 'Contributor',
};

export const ROLE_SUMMARY: Record<Role, string> = {
  owner: 'Everything, including staff accounts and connected services.',
  admin: 'Edit and publish the menu, events, pages and photos.',
  editor: 'Edit anything allowed and save it as a draft for a manager to publish.',
};

export type Capability =
  /** Change content and save it as a draft. */
  | 'content.edit'
  /** Make a change public. */
  | 'content.publish'
  /** Take something off the website without deleting it. */
  | 'content.archive'
  /** Put an earlier version back. */
  | 'content.restore'
  /** Upload a photo or video. */
  | 'media.upload'
  /** Remove a media file permanently. */
  | 'media.delete'
  /** Read and update enquiries. */
  | 'inquiries.manage'
  /** Change address, hours, phone, ordering and reservation links. */
  | 'settings.manage'
  /** Change staff accounts and roles. */
  | 'team.manage'
  /** Change connected services and anything with a credential attached. */
  | 'integrations.manage';

const MATRIX: Record<Role, Capability[]> = {
  owner: [
    'content.edit',
    'content.publish',
    'content.archive',
    'content.restore',
    'media.upload',
    'media.delete',
    'inquiries.manage',
    'settings.manage',
    'team.manage',
    'integrations.manage',
  ],
  admin: [
    'content.edit',
    'content.publish',
    'content.archive',
    'content.restore',
    'media.upload',
    'inquiries.manage',
    'settings.manage',
  ],
  editor: ['content.edit', 'media.upload', 'inquiries.manage'],
};

/** Admin sections a Contributor can be restricted to. Empty means all of them. */
export const SECTIONS = ['menu', 'events', 'website', 'media', 'settings'] as const;
export type Section = (typeof SECTIONS)[number];

export interface Actor {
  role: Role;
  /** Contributor-only restriction. Empty array means no restriction. */
  sections?: readonly string[];
  active?: boolean;
}

export function can(actor: Actor, capability: Capability): boolean {
  if (actor.active === false) return false;
  return MATRIX[actor.role]?.includes(capability) ?? false;
}

/**
 * Whether this person may open an admin section at all.
 *
 * Section restrictions only narrow a Contributor. Restricting a Manager would be
 * a way to lock the Owner out of their own settings by accident.
 */
export function canOpen(actor: Actor, section: Section): boolean {
  if (actor.active === false) return false;
  if (section === 'settings') return can(actor, 'settings.manage');
  if (actor.role !== 'editor') return true;
  const allowed = actor.sections ?? [];
  return allowed.length === 0 || allowed.includes(section);
}

/** The message a blocked staff member sees. Explains, never just refuses. */
export const DENIED_MESSAGE: Record<Capability, string> = {
  'content.edit': 'Your account cannot change this. Ask a manager.',
  'content.publish':
    'Your account can save drafts, but a manager needs to publish them. Your work is saved.',
  'content.archive': 'Only a manager or the owner can take something off the website.',
  'content.restore': 'Only a manager or the owner can put an earlier version back.',
  'media.upload': 'Your account cannot upload photos.',
  'media.delete': 'Only the owner can delete a file for good. You can archive it instead.',
  'inquiries.manage': 'Your account cannot open enquiries.',
  'settings.manage': 'Only a manager or the owner can change the restaurant details.',
  'team.manage': 'Only the owner can change staff accounts.',
  'integrations.manage': 'Only the owner can change connected services.',
};

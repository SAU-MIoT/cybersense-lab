import { describe, expect, it } from 'vitest';
import {
  MAX_RESEARCH_IMAGE_BYTES,
  projectImagePathFromUrl,
  researchImagePathFromUrl,
  teamMemberImagePathFromUrl,
  validateResearchAreaImage,
} from './researchAreaImages';

describe('research area image helpers', () => {
  it('accepts supported image files and rejects unsafe types', () => {
    expect(() => validateResearchAreaImage(new File(['image'], 'icon.webp', { type: 'image/webp' }))).not.toThrow();
    expect(() => validateResearchAreaImage(new File(['svg'], 'icon.svg', { type: 'image/svg+xml' }))).toThrow(/JPG/);
  });

  it('rejects files larger than 5 MB', () => {
    const oversized = new File([new Uint8Array(MAX_RESEARCH_IMAGE_BYTES + 1)], 'large.png', { type: 'image/png' });
    expect(() => validateResearchAreaImage(oversized)).toThrow(/5 MB/);
  });

  it('extracts only research-area object paths from public bucket URLs', () => {
    expect(researchImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/research-area-images/research-areas/user/image.webp',
    )).toBe('research-areas/user/image.webp');
    expect(researchImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/research-area-images/legacy/image.webp',
    )).toBeNull();
    expect(researchImagePathFromUrl('fa-shield')).toBeNull();
  });

  it('extracts only team-member paths from the team image bucket', () => {
    expect(teamMemberImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/team-member-images/team-members/user/photo.png',
    )).toBe('team-members/user/photo.png');
    expect(teamMemberImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/research-area-images/research-areas/user/icon.png',
    )).toBeNull();
  });

  it('extracts project cover paths only from the project bucket', () => {
    expect(projectImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/project-images/projects/user/cover.webp',
    )).toBe('projects/user/cover.webp');
    expect(projectImagePathFromUrl(
      'https://example.supabase.co/storage/v1/object/public/team-member-images/team-members/user/photo.png',
    )).toBeNull();
  });
});

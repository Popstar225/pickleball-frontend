import { get } from '@/lib/api';

// ─── Raw API shapes ───────────────────────────────────────────────────────────

export interface CoachFromAPI {
  id: string;
  username: string;
  full_name: string | null;
  profile_photo: string | null;
  bio: string | null;
  state: string | null;
  city: string | null;
  skill_level: string | null;
  coaching_experience: number;
  specializations: string[] | null;
  hourly_rate: number | null;
  coaching_languages: string[] | null;
  coaching_bio: string | null;
  certifications: Array<string | { name?: string; level?: string; title?: string }> | null;
  rating: number;
  reviews_count: number;
  total_students: number;
  active_students: number;
  lesson_types_offered: string[] | null;
  email?: string;
  phone?: string;
  website?: string;
  experience_level?: string;
  availability_status?: string;
}

// ─── Normalized display shape ─────────────────────────────────────────────────

export interface RefereeDisplay {
  id: string;
  name: string;
  avatar: string;
  certification: string;
  state: string;
  email: string;
  phone: string;
  eventsOfficiated: number;
  yearsExperience: number;
  specialization: string;
  bio: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function extractCertification(
  certifications: CoachFromAPI['certifications'],
): string {
  if (!certifications || certifications.length === 0) return 'Level 1 - Local';
  const first = certifications[0];
  if (typeof first === 'string') return first;
  return first.name || first.level || first.title || 'Level 1 - Local';
}

export function normalizeCoach(c: CoachFromAPI): RefereeDisplay {
  const name = c.full_name || c.username;
  return {
    id: c.id,
    name,
    avatar:
      c.profile_photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ace600&color=0d1117&size=128`,
    certification: extractCertification(c.certifications),
    state: c.state || '—',
    email: c.email || '',
    phone: c.phone || '',
    eventsOfficiated: c.reviews_count ?? 0,
    yearsExperience: c.coaching_experience ?? 0,
    specialization: c.specializations?.[0] || 'General',
    bio: c.coaching_bio || c.bio || '',
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

interface CoachSearchResponse {
  success: boolean;
  data: {
    coaches: CoachFromAPI[];
    total: number;
    page: number;
    totalPages: number;
  };
}

interface CoachProfileResponse {
  success: boolean;
  data: {
    coach: CoachFromAPI;
  };
}

export async function fetchCoaches(params?: { limit?: number; offset?: number }) {
  const res = await get<CoachSearchResponse>('/coaches/search', {
    params: { limit: 100, ...params },
  });
  return res.data;
}

export async function fetchCoachProfile(id: string): Promise<CoachFromAPI> {
  const res = await get<CoachProfileResponse>(`/coaches/${id}/profile`);
  return res.data.coach;
}

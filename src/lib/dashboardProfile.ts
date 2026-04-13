import { fetchCurrentUserProfile } from './profile';

export async function fetchDashboardProfile(userId: string) {
  return fetchCurrentUserProfile(userId);
}

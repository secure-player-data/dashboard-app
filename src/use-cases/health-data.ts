import {
  fetchInjuries,
  fetchMedicalReports,
  fetchVaccinations,
} from '@/api/data/health-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  injuries: (player: string) => ['injuries', player],
  medicalReports: (player: string) => ['medicalReports', player],
  vaccinations: (player: string) => ['vaccinations', player],
};

export function useGetInjuries(session: Session | null, player: string) {
  return useQuery({
    queryKey: queryKeys.injuries(player),
    queryFn: () => fetchInjuries(session, player),
    enabled: !!session,
  });
}

export function useGetMedicalReports(
  session: Session | null,
  playerPod: string
) {
  return useQuery({
    queryKey: queryKeys.medicalReports(playerPod),
    queryFn: () => fetchMedicalReports(session, playerPod),
    enabled: !!session,
  });
}

export function useGetVaccinations(session: Session | null, playerPod: string) {
  return useQuery({
    queryKey: queryKeys.vaccinations(playerPod),
    queryFn: () => fetchVaccinations(session, playerPod),
    enabled: !!session,
  });
}

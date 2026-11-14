import { SupabaseClient } from '@supabase/supabase-js';
import { RequestItem, CraftsmanUser } from './types';

export declare const isSupabaseConfigured: boolean;
export declare const supabase: SupabaseClient;

export type CraftsmanWithReveals = CraftsmanUser & {
  revealedPhones?: string[];
};

export declare function mapDemandeRowToRequestItem(row: Record<string, any>): RequestItem | null;
export declare function mapRequestItemToDemandePayload(req: RequestItem): {
  client_name: string;
  client_phone: string;
  wilaya: string;
  metier: string;
  message: string;
  status: string;
};
export declare function mapArtisanRowToCraftsmanUser(row: Record<string, any>): CraftsmanWithReveals | null;
export declare function mapCraftsmanUserToArtisanPayload(
  craftsman: CraftsmanUser,
  revealedPhonesList?: string[]
): {
  full_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  metier: string;
  description: string;
  price: number;
  is_active: boolean;
};

export declare function fetchPointsFromSupabase(): Promise<Record<string, number>>;
export declare function savePointsToSupabase(
  idOrCraftsman: CraftsmanUser | string,
  pointsValue: number
): Promise<{ id: string; points: number }>;

export declare function fetchDemandesFromSupabase(): Promise<RequestItem[] | null>;
export declare function saveDemandeToSupabase(req: RequestItem): Promise<RequestItem | null>;
export declare function deleteDemandeFromSupabase(reqOrId: RequestItem | string): Promise<void>;

export declare function fetchArtisansFromSupabase(): Promise<CraftsmanWithReveals[] | null>;
export declare function saveArtisanToSupabase(
  craftsman: CraftsmanUser,
  revealedPhonesList?: string[]
): Promise<CraftsmanWithReveals | null>;
export declare function syncCraftsmanPointsToSupabase(
  craftsman: CraftsmanUser,
  nextPoints: number,
  revealedPhonesList?: string[]
): Promise<CraftsmanWithReveals | null>;

export declare function subscribeToSupabaseRealtime(callbacks: {
  onDemandesSnapshot?: (demandes: RequestItem[]) => void;
  onArtisansSnapshot?: (artisans: CraftsmanWithReveals[]) => void;
  onSingleDemandeChange?: (demande: RequestItem) => void;
  onSingleArtisanChange?: (artisan: CraftsmanWithReveals) => void;
}): () => void;

export declare const GUARDIAN_BOT_24_7_DUTY: {
  project: string;
  supabaseUrl: string;
  region: string;
  vercelProject: string;
  tables: string[];
  mode: string;
  rules: string;
};

export declare function startSync(): void;

export default supabase;


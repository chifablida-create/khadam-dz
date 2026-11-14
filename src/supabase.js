import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rtohqtpkkhmmshcthnbl.supabase.co';

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0b2hxdHBra2htbXNoY3RobmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

const KDZ_META_MARKER = '\n<!--kdz:';
const KDZ_META_END = '-->';

// In-memory 24/24 Guardian Bot store keyed strictly by id (Zero localStorage usage)
const guardianDemandesById = new Map();
const guardianArtisansById = new Map();
const guardianPointsById = new Map();
const pendingOutboundDemandes = new Map();
const pendingOutboundArtisans = new Map();
const pendingOutboundPoints = new Map();

function packTextWithMeta(cleanText, metaObj) {
  const base = String(cleanText || '').split(KDZ_META_MARKER)[0].trim();
  if (!metaObj || Object.keys(metaObj).length === 0) return base;
  try {
    return `${base}${KDZ_META_MARKER}${JSON.stringify(metaObj)}${KDZ_META_END}`;
  } catch {
    return base;
  }
}

function unpackTextAndMeta(rawText) {
  const str = String(rawText || '');
  const idx = str.indexOf(KDZ_META_MARKER);
  if (idx === -1) {
    return { text: str.trim(), meta: {} };
  }
  const cleanText = str.slice(0, idx).trim();
  const rest = str.slice(idx + KDZ_META_MARKER.length);
  const endIdx = rest.indexOf(KDZ_META_END);
  const jsonPart = endIdx !== -1 ? rest.slice(0, endIdx) : rest;
  try {
    return { text: cleanText, meta: JSON.parse(jsonPart) || {} };
  } catch {
    return { text: cleanText, meta: {} };
  }
}

export function mapDemandeRowToRequestItem(row) {
  if (!row) return null;
  const { text: cleanDesc, meta } = unpackTextAndMeta(row.message || '');
  const rawId =
    row.id !== undefined && row.id !== null
      ? String(row.id)
      : meta.appId || `dem_${Date.now()}`;
  const createdTs = row.created_at
    ? new Date(row.created_at).getTime()
    : typeof meta.createdAt === 'number'
    ? meta.createdAt
    : Date.now();

  const statusVal =
    row.status === 'in_progress' || row.status === 'completed' || row.status === 'open'
      ? row.status
      : meta.isAgreed
      ? 'in_progress'
      : 'open';

  const mapped = {
    id: rawId,
    title: String(row.client_name || cleanDesc || 'طلب خدمة').trim(),
    phone: String(row.client_phone || '0550000000').trim(),
    wilaya: String(row.wilaya || '16 الجزائر').trim(),
    craft: String(row.metier || 'سباك').trim(),
    desc: cleanDesc || String(row.client_name || ''),
    status: statusVal,
    priority: meta.priority !== undefined ? Boolean(meta.priority) : true,
    createdAt: Number.isNaN(createdTs) ? Date.now() : createdTs,
    isCustomerOwn: Boolean(meta.isCustomerOwn),
    revealedByCraftsmanName: String(meta.revealedByCraftsmanName || '').trim(),
    agreedByCraftsmanName: String(meta.agreedByCraftsmanName || '').trim(),
    isAgreed: Boolean(meta.isAgreed || statusVal === 'in_progress' || statusVal === 'completed'),
    agreementTimeNote: String(meta.agreementTimeNote || '').trim(),
    agreementScheduledAt: Number(meta.agreementScheduledAt || 0),
    agreementReminderMinutes: Number(meta.agreementReminderMinutes || 30),
    cancellationReason: String(meta.cancellationReason || '').trim(),
    customerRatingStars: Number(meta.customerRatingStars || 0),
    customerRatingComment: String(meta.customerRatingComment || '').trim(),
    customerRatedAt: Number(meta.customerRatedAt || 0)
  };
  guardianDemandesById.set(String(mapped.id), mapped);
  return mapped;
}

export function mapRequestItemToDemandePayload(req) {
  const meta = {
    appId: req.id,
    priority: Boolean(req.priority),
    createdAt: req.createdAt || Date.now(),
    isCustomerOwn: Boolean(req.isCustomerOwn),
    revealedByCraftsmanName: req.revealedByCraftsmanName || '',
    agreedByCraftsmanName: req.agreedByCraftsmanName || '',
    isAgreed: Boolean(req.isAgreed),
    agreementTimeNote: req.agreementTimeNote || '',
    agreementScheduledAt: req.agreementScheduledAt || 0,
    agreementReminderMinutes: req.agreementReminderMinutes || 30,
    cancellationReason: req.cancellationReason || '',
    customerRatingStars: req.customerRatingStars || 0,
    customerRatingComment: req.customerRatingComment || '',
    customerRatedAt: req.customerRatedAt || 0
  };

  return {
    client_name: String(req.title || 'زبون خدّام DZ').trim(),
    client_phone: String(req.phone || '0550000000').trim(),
    wilaya: String(req.wilaya || '16 الجزائر').trim(),
    metier: String(req.craft || 'سباك').trim(),
    message: packTextWithMeta(req.desc || req.title || '', meta),
    status: req.status === 'in_progress' || req.status === 'completed' ? req.status : 'open'
  };
}

export function mapArtisanRowToCraftsmanUser(row) {
  if (!row) return null;
  const { text: cleanBio, meta } = unpackTextAndMeta(row.description || '');
  const rawId =
    row.id !== undefined && row.id !== null
      ? String(row.id)
      : meta.appId || `art_${Date.now()}`;
  const pointsFromTable = guardianPointsById.get(rawId);
  const pointsVal =
    typeof pointsFromTable === 'number'
      ? pointsFromTable
      : typeof row.points === 'number'
      ? row.points
      : typeof row.price === 'number'
      ? row.price
      : Number(row.price ?? meta.points ?? 50);

  const mapped = {
    id: rawId,
    name: String(row.full_name || 'حرفي معتمد').trim(),
    phone: String(row.phone || '0550000000').trim(),
    wilaya: String(row.wilaya || '16 الجزائر').trim(),
    experience: String(row.commune || meta.experience || '5 سنوات').trim(),
    craft: String(row.metier || 'سباك').trim(),
    bio: cleanBio || 'حرفي معتمد في منصة خدّام ديزاد',
    points: Number.isNaN(pointsVal) ? 50 : Math.max(0, pointsVal),
    status: row.is_active === false ? 'suspended' : 'active',
    isVerified: true,
    isVip: Boolean(meta.isVip),
    baseAvg: typeof meta.baseAvg === 'number' ? meta.baseAvg : 4.9,
    baseCount: typeof meta.baseCount === 'number' ? meta.baseCount : 12,
    complaints: typeof meta.complaints === 'number' ? meta.complaints : 0,
    revealedPhones: Array.isArray(meta.revealedPhones) ? meta.revealedPhones.map(String) : []
  };
  guardianArtisansById.set(String(mapped.id), mapped);
  guardianPointsById.set(String(mapped.id), mapped.points);
  return mapped;
}

export function mapCraftsmanUserToArtisanPayload(craftsman, revealedPhonesList) {
  const pointsVal =
    typeof craftsman.points === 'number' && !Number.isNaN(craftsman.points)
      ? Math.max(0, Math.floor(craftsman.points))
      : 50;

  const meta = {
    appId: craftsman.id,
    points: pointsVal,
    experience: craftsman.experience || '5 سنوات',
    baseAvg: craftsman.baseAvg ?? 4.9,
    baseCount: craftsman.baseCount ?? 12,
    complaints: craftsman.complaints ?? 0,
    isVip: Boolean(craftsman.isVip),
    revealedPhones: Array.isArray(revealedPhonesList)
      ? revealedPhonesList
      : Array.isArray(craftsman.revealedPhones)
      ? craftsman.revealedPhones
      : []
  };

  return {
    full_name: String(craftsman.name || 'حرفي معتمد').trim(),
    phone: String(craftsman.phone || '0550000000').trim(),
    wilaya: String(craftsman.wilaya || '16 الجزائر').trim(),
    commune: String(craftsman.experience || 'الجزائر').trim(),
    metier: String(craftsman.craft || 'سباك').trim(),
    description: packTextWithMeta(craftsman.bio || 'حرفي معتمد في منصة خدّام ديزاد', meta),
    price: pointsVal,
    is_active: craftsman.status !== 'suspended'
  };
}

function emitGuardianSyncToReact(detail) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('khadam:supabase-sync', {
        detail: {
          ...detail,
          requests: Array.from(guardianDemandesById.values()),
          craftsmen: Array.from(guardianArtisansById.values()),
          pointsMap: Object.fromEntries(guardianPointsById.entries()),
          timestamp: Date.now()
        }
      })
    );
  } catch {
    // ignore event errors
  }
}

export async function fetchPointsFromSupabase() {
  try {
    const { data, error } = await supabase.from('points').select('*');
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (row && row.id !== undefined && row.id !== null) {
          const val = Number(
            row.points ?? row.balance ?? row.value ?? row.amount ?? row.pts ?? 50
          );
          if (!Number.isNaN(val)) {
            const idKey = String(row.id);
            guardianPointsById.set(idKey, Math.max(0, Math.floor(val)));
            const existingArtisan = guardianArtisansById.get(idKey);
            if (existingArtisan) {
              guardianArtisansById.set(idKey, {
                ...existingArtisan,
                points: Math.max(0, Math.floor(val))
              });
            }
          }
        }
      }
      return Object.fromEntries(guardianPointsById.entries());
    }
  } catch {
    // points table optional if points stored in artisans
  }
  return Object.fromEntries(guardianPointsById.entries());
}

export async function savePointsToSupabase(idOrCraftsman, pointsValue) {
  const rawId =
    typeof idOrCraftsman === 'object' && idOrCraftsman !== null
      ? idOrCraftsman.id
      : idOrCraftsman;
  const idStr = String(rawId || 'global_points').trim();
  const cleanPts = Math.max(0, Math.floor(Number(pointsValue) || 0));

  guardianPointsById.set(idStr, cleanPts);
  const existingArtisan = guardianArtisansById.get(idStr);
  if (existingArtisan) {
    guardianArtisansById.set(idStr, { ...existingArtisan, points: cleanPts });
  }

  try {
    // Upsert by id in points table (if id exists -> update, if not -> insert; never delete)
    const { data: existingPts, error: selErr } = await supabase
      .from('points')
      .select('id')
      .eq('id', idStr)
      .limit(1);

    if (!selErr) {
      if (Array.isArray(existingPts) && existingPts.length > 0) {
        await supabase.from('points').update({ points: cleanPts }).eq('id', idStr);
      } else {
        await supabase.from('points').insert([{ id: idStr, points: cleanPts }]);
      }
    }
  } catch {
    pendingOutboundPoints.set(idStr, cleanPts);
  }

  broadcastRealtimeEvent('points_updated', { id: idStr, points: cleanPts });
  emitGuardianSyncToReact({ type: 'points_updated', id: idStr, points: cleanPts });
  return { id: idStr, points: cleanPts };
}

export async function fetchDemandesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('demandes')
      .select('id, client_name, client_phone, wilaya, metier, message, status, created_at')
      .order('id', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('demandes')
        .select('id, client_name, client_phone, wilaya, metier, message, status');
      if (fallback.error || !Array.isArray(fallback.data)) return null;
      return fallback.data.map(mapDemandeRowToRequestItem).filter(Boolean);
    }
    if (!Array.isArray(data)) return null;
    return data.map(mapDemandeRowToRequestItem).filter(Boolean);
  } catch {
    return null;
  }
}

// Upsert by id (if id exists -> update, if not -> insert. Never delete!)
export async function saveDemandeToSupabase(req) {
  if (!req) return null;
  const reqId = String(req.id || `dem_${Date.now()}`);
  guardianDemandesById.set(reqId, { ...req, id: reqId });
  const payload = mapRequestItemToDemandePayload(req);

  try {
    // 1. Check if id exists directly in demandes
    const numericId = Number(reqId);
    const idFilterVal =
      !Number.isNaN(numericId) && numericId > 0 && String(numericId) === reqId
        ? numericId
        : reqId;

    const { data: byIdRows, error: byIdErr } = await supabase
      .from('demandes')
      .select('id')
      .eq('id', idFilterVal)
      .limit(1);

    if (!byIdErr && Array.isArray(byIdRows) && byIdRows.length > 0 && byIdRows[0]?.id != null) {
      const { data: updatedById, error: updIdErr } = await supabase
        .from('demandes')
        .update(payload)
        .eq('id', byIdRows[0].id)
        .select();
      if (!updIdErr && Array.isArray(updatedById) && updatedById.length > 0) {
        const mapped = mapDemandeRowToRequestItem(updatedById[0]);
        pendingOutboundDemandes.delete(reqId);
        broadcastRealtimeEvent('demande_updated', mapped);
        emitGuardianSyncToReact({ type: 'demande_updated', demande: mapped });
        return mapped;
      }
    }

    // 2. Also check if a row with same appId in message or same client_name + wilaya + metier exists
    const { data: existingRows } = await supabase
      .from('demandes')
      .select('id')
      .eq('client_name', payload.client_name)
      .eq('wilaya', payload.wilaya)
      .eq('metier', payload.metier)
      .limit(1);

    if (Array.isArray(existingRows) && existingRows.length > 0 && existingRows[0]?.id != null) {
      const { data: updatedRows, error: updErr } = await supabase
        .from('demandes')
        .update(payload)
        .eq('id', existingRows[0].id)
        .select();
      if (!updErr && Array.isArray(updatedRows) && updatedRows.length > 0) {
        const mapped = mapDemandeRowToRequestItem(updatedRows[0]);
        pendingOutboundDemandes.delete(reqId);
        broadcastRealtimeEvent('demande_updated', mapped);
        emitGuardianSyncToReact({ type: 'demande_updated', demande: mapped });
        return mapped;
      }
    }

    // 3. If id does not exist -> insert new row
    const { data: insertedRows, error: insErr } = await supabase
      .from('demandes')
      .insert([payload])
      .select();

    if (!insErr && Array.isArray(insertedRows) && insertedRows.length > 0) {
      const mapped = mapDemandeRowToRequestItem(insertedRows[0]);
      pendingOutboundDemandes.delete(reqId);
      broadcastRealtimeEvent('demande_inserted', mapped);
      emitGuardianSyncToReact({ type: 'demande_inserted', demande: mapped });
      return mapped;
    }

    pendingOutboundDemandes.set(reqId, req);
  } catch {
    pendingOutboundDemandes.set(reqId, req);
  }
  return null;
}

// Rule: Never delete data from Supabase ("لا تحذف أبدا. إذا id موجود، حدّثه. إذا غير موجود، أضفه")
export async function deleteDemandeFromSupabase(reqOrId) {
  try {
    const rawObj = typeof reqOrId === 'object' && reqOrId !== null ? reqOrId : null;
    const rawId = typeof reqOrId === 'string' ? reqOrId : reqOrId?.id;
    if (rawObj) {
      await saveDemandeToSupabase({ ...rawObj, status: rawObj.status || 'completed' });
    } else if (rawId && guardianDemandesById.has(String(rawId))) {
      const existing = guardianDemandesById.get(String(rawId));
      await saveDemandeToSupabase({ ...existing, status: 'completed' });
    }
  } catch {
    // ignore
  }
}

export async function fetchArtisansFromSupabase() {
  try {
    await fetchPointsFromSupabase();
    const { data, error } = await supabase
      .from('artisans')
      .select('id, full_name, phone, wilaya, commune, metier, description, price, is_active')
      .order('id', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('artisans')
        .select('full_name, phone, wilaya, commune, metier, description, price, is_active');
      if (fallback.error || !Array.isArray(fallback.data)) return null;
      return fallback.data.map(mapArtisanRowToCraftsmanUser).filter(Boolean);
    }
    if (!Array.isArray(data)) return null;
    return data.map(mapArtisanRowToCraftsmanUser).filter(Boolean);
  } catch {
    return null;
  }
}

// Upsert by id (if id exists -> update, if not -> insert. Never delete!)
export async function saveArtisanToSupabase(craftsman, revealedPhonesList) {
  if (!craftsman) return null;
  const crId = String(craftsman.id || `art_${Date.now()}`);
  guardianArtisansById.set(crId, { ...craftsman, id: crId });
  const payload = mapCraftsmanUserToArtisanPayload(craftsman, revealedPhonesList);

  // Sync points table by id as well
  savePointsToSupabase(crId, payload.price).catch(() => {});

  try {
    const numericId = Number(crId);
    const idFilterVal =
      !Number.isNaN(numericId) && numericId > 0 && String(numericId) === crId
        ? numericId
        : crId;

    const { data: byIdRows, error: byIdErr } = await supabase
      .from('artisans')
      .select('id')
      .eq('id', idFilterVal)
      .limit(1);

    if (!byIdErr && Array.isArray(byIdRows) && byIdRows.length > 0 && byIdRows[0]?.id != null) {
      const { data, error } = await supabase
        .from('artisans')
        .update(payload)
        .eq('id', byIdRows[0].id)
        .select();
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = mapArtisanRowToCraftsmanUser(data[0]);
        pendingOutboundArtisans.delete(crId);
        broadcastRealtimeEvent('artisan_updated', mapped);
        emitGuardianSyncToReact({ type: 'artisan_updated', artisan: mapped });
        return mapped;
      }
    }

    // Check by phone so same craftsman keeps same id and points across all phones
    const cleanPhone = payload.phone;
    const { data: existingByPhone } = await supabase
      .from('artisans')
      .select('id, full_name, phone, wilaya, commune, metier, description, price, is_active')
      .eq('phone', cleanPhone)
      .limit(1);

    if (Array.isArray(existingByPhone) && existingByPhone.length > 0 && existingByPhone[0]?.id != null) {
      const { data: updatedRows, error: updErr } = await supabase
        .from('artisans')
        .update(payload)
        .eq('id', existingByPhone[0].id)
        .select();
      if (!updErr && Array.isArray(updatedRows) && updatedRows.length > 0) {
        const mapped = mapArtisanRowToCraftsmanUser(updatedRows[0]);
        pendingOutboundArtisans.delete(crId);
        broadcastRealtimeEvent('artisan_updated', mapped);
        emitGuardianSyncToReact({ type: 'artisan_updated', artisan: mapped });
        return mapped;
      }
    }

    const { data: insertedRows, error: insErr } = await supabase
      .from('artisans')
      .insert([payload])
      .select();

    if (!insErr && Array.isArray(insertedRows) && insertedRows.length > 0) {
      const mapped = mapArtisanRowToCraftsmanUser(insertedRows[0]);
      pendingOutboundArtisans.delete(crId);
      broadcastRealtimeEvent('artisan_inserted', mapped);
      emitGuardianSyncToReact({ type: 'artisan_inserted', artisan: mapped });
      return mapped;
    }

    pendingOutboundArtisans.set(crId, { craftsman, revealedPhonesList });
  } catch {
    pendingOutboundArtisans.set(crId, { craftsman, revealedPhonesList });
  }
  return null;
}

export async function syncCraftsmanPointsToSupabase(craftsman, nextPoints, revealedPhonesList) {
  if (!craftsman) return null;
  const cleanPts = Math.max(0, Math.floor(Number(nextPoints) || 0));
  await savePointsToSupabase(craftsman.id, cleanPts);
  const updatedCraftsman = {
    ...craftsman,
    points: cleanPts
  };
  return saveArtisanToSupabase(updatedCraftsman, revealedPhonesList);
}

let activeBroadcastChannel = null;
let guardianBotStarted = false;

function broadcastRealtimeEvent(event, payload) {
  try {
    if (activeBroadcastChannel) {
      activeBroadcastChannel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  } catch {
    // ignore
  }
}

export function subscribeToSupabaseRealtime(callbacks) {
  try {
    const channel = supabase
      .channel('khadma-dz-realtime-all-phones')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'demandes' },
        async () => {
          const list = await fetchDemandesFromSupabase();
          if (list) {
            callbacks?.onDemandesSnapshot?.(list);
            emitGuardianSyncToReact({ type: 'demandes_snapshot', demandes: list });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artisans' },
        async () => {
          const list = await fetchArtisansFromSupabase();
          if (list) {
            callbacks?.onArtisansSnapshot?.(list);
            emitGuardianSyncToReact({ type: 'artisans_snapshot', artisans: list });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'points' },
        async () => {
          await fetchPointsFromSupabase();
          const list = await fetchArtisansFromSupabase();
          if (list) {
            callbacks?.onArtisansSnapshot?.(list);
          }
          emitGuardianSyncToReact({ type: 'points_snapshot' });
        }
      )
      .on('broadcast', { event: 'demande_inserted' }, ({ payload }) => {
        if (payload && payload.id) {
          guardianDemandesById.set(String(payload.id), payload);
          callbacks?.onSingleDemandeChange?.(payload);
          emitGuardianSyncToReact({ type: 'demande_inserted', demande: payload });
        }
      })
      .on('broadcast', { event: 'demande_updated' }, ({ payload }) => {
        if (payload && payload.id) {
          guardianDemandesById.set(String(payload.id), payload);
          callbacks?.onSingleDemandeChange?.(payload);
          emitGuardianSyncToReact({ type: 'demande_updated', demande: payload });
        }
      })
      .on('broadcast', { event: 'artisan_inserted' }, ({ payload }) => {
        if (payload && payload.id) {
          guardianArtisansById.set(String(payload.id), payload);
          callbacks?.onSingleArtisanChange?.(payload);
          emitGuardianSyncToReact({ type: 'artisan_inserted', artisan: payload });
        }
      })
      .on('broadcast', { event: 'artisan_updated' }, ({ payload }) => {
        if (payload && payload.id) {
          guardianArtisansById.set(String(payload.id), payload);
          callbacks?.onSingleArtisanChange?.(payload);
          emitGuardianSyncToReact({ type: 'artisan_updated', artisan: payload });
        }
      })
      .on('broadcast', { event: 'points_updated' }, ({ payload }) => {
        if (payload && payload.id !== undefined) {
          const idKey = String(payload.id);
          const pts = Math.max(0, Math.floor(Number(payload.points) || 0));
          guardianPointsById.set(idKey, pts);
          const existingArt = guardianArtisansById.get(idKey);
          if (existingArt) {
            const updatedArt = { ...existingArt, points: pts };
            guardianArtisansById.set(idKey, updatedArt);
            callbacks?.onSingleArtisanChange?.(updatedArt);
          }
          emitGuardianSyncToReact({ type: 'points_updated', id: idKey, points: pts });
        }
      })
      .subscribe();

    activeBroadcastChannel = channel;

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch {
    return () => {};
  }
}

// ============================================================================
// بوت الحارس 24/24 (ذهاب وإياب كامل بين التطبيق و Supabase لكل الهواتف بدون عراقيل)
// يُشغَّل من src/main.tsx فقط
// ============================================================================
export const GUARDIAN_BOT_24_7_DUTY = {
  project: 'khadam-dz',
  supabaseUrl: 'https://rtohqtpkkhmmshcthnbl.supabase.co',
  region: 'eu-west-3',
  vercelProject: 'khadam-dz-adua',
  tables: ['demandes', 'artisans', 'points'],
  mode: '24/24_BIDIRECTIONAL_SYNC_NO_LOCALSTORAGE',
  rules: 'UPSERT_BY_ID_ONLY_NEVER_DELETE'
};

let guardianCyclesCount = 0;

export function startSync() {
  if (guardianBotStarted) return;
  guardianBotStarted = true;

  const runBidirectionalGuardianCycle = async () => {
    try {
      guardianCyclesCount += 1;

      // 0. تذكير البوت بعمله 24/24 وإعادة فتح قناة البث الفوري تلقائياً إذا انقطعت على أي هاتف
      if (!activeBroadcastChannel || activeBroadcastChannel.state === 'closed' || activeBroadcastChannel.state === 'errored') {
        subscribeToSupabaseRealtime({});
      }

      // 1. Outbound (ذهاب): Push any pending requests, artisans, or points to Supabase by id
      for (const [reqId, reqItem] of Array.from(pendingOutboundDemandes.entries())) {
        await saveDemandeToSupabase(reqItem);
        pendingOutboundDemandes.delete(reqId);
      }
      for (const [crId, entry] of Array.from(pendingOutboundArtisans.entries())) {
        await saveArtisanToSupabase(entry.craftsman, entry.revealedPhonesList);
        pendingOutboundArtisans.delete(crId);
      }
      for (const [ptId, ptsVal] of Array.from(pendingOutboundPoints.entries())) {
        await savePointsToSupabase(ptId, ptsVal);
        pendingOutboundPoints.delete(ptId);
      }

      // 2. Inbound (إياب): Pull latest demandes, artisans, and points from Supabase and push immediately to React
      const [demandes, artisans] = await Promise.all([
        fetchDemandesFromSupabase(),
        fetchArtisansFromSupabase()
      ]);

      if ((Array.isArray(demandes) && demandes.length > 0) || (Array.isArray(artisans) && artisans.length > 0)) {
        emitGuardianSyncToReact({
          type: 'guardian_cycle',
          demandes: demandes || [],
          artisans: artisans || []
        });
      }

      if (typeof window !== 'undefined') {
        window.__KDZ_GUARDIAN_BOT_24_7_STATUS__ = {
          ...GUARDIAN_BOT_24_7_DUTY,
          active: true,
          cyclesCount: guardianCyclesCount,
          lastSyncAt: Date.now()
        };
      }
    } catch {
      // Guardian bot never stops or crashes
    }
  };

  // Run immediately on boot
  runBidirectionalGuardianCycle();

  // Subscribe to real-time Postgres changes & broadcast events
  subscribeToSupabaseRealtime({});

  // Run 24/24 non-stop every 5 seconds + on focus/visibility/online
  if (typeof window !== 'undefined') {
    setInterval(runBidirectionalGuardianCycle, 5000);
    window.addEventListener('focus', runBidirectionalGuardianCycle);
    window.addEventListener('online', runBidirectionalGuardianCycle);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          runBidirectionalGuardianCycle();
        }
      });
    }
    window.__KDZ_FORCE_BOT_30S_SYNC__ = runBidirectionalGuardianCycle;
    window.__KDZ_SUPABASE_GUARDIAN_ACTIVE__ = true;
  }
}

export default supabase;


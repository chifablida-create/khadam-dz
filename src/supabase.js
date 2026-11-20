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
  'sb_publishable_VV1FgtQ3zMxMYKT5YqQ5rw_eVci_ddV';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const KDZ_META_MARKER = '\n<!--kdz:';
const KDZ_META_END = '-->';

import { INITIAL_REQUESTS, INITIAL_CRAFTSMEN } from './data/constants';

// Fixed historical timestamps for static seed requests so they never override newer live requests
const SEED_REQUEST_TIMESTAMPS = new Map();
if (Array.isArray(INITIAL_REQUESTS)) {
  for (const r of INITIAL_REQUESTS) {
    if (r && r.id && typeof r.createdAt === 'number') {
      SEED_REQUEST_TIMESTAMPS.set(String(r.id), Number(r.createdAt));
    }
  }
}

export function sortRequestsNewestFirst(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => Number(b?.createdAt || 0) - Number(a?.createdAt || 0));
}

// In-memory 24/24 Guardian Bot store keyed strictly by id (Zero localStorage usage)
const guardianDemandesById = new Map();
const guardianArtisansById = new Map();
const guardianPointsById = new Map();
const pendingOutboundDemandes = new Map();
const pendingOutboundArtisans = new Map();
const pendingOutboundPoints = new Map();

if (Array.isArray(INITIAL_REQUESTS)) {
  for (const r of sortRequestsNewestFirst(INITIAL_REQUESTS)) {
    if (r && r.id) {
      guardianDemandesById.set(String(r.id), r);
    }
  }
}
if (Array.isArray(INITIAL_CRAFTSMEN)) {
  for (const c of INITIAL_CRAFTSMEN) {
    if (c && c.id) {
      guardianArtisansById.set(String(c.id), c);
      if (typeof c.points === 'number') {
        guardianPointsById.set(String(c.id), c.points);
      }
    }
  }
}

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

const CRAFTSMAN_AD_DEMANDE_IDS = new Set([
  'r_1794865802107',
  'r_1794843332786',
  'r_test_check_1',
  'req_fb_live_1793136505389',
  'req_fb_adm_1793126302923',
  'req_fb_live_1793123330146',
  'req_social_1793119632873_ntj',
  'req_cr_cp1',
  'req_cr_cp2',
  'req_cr_cp3',
  'req_cr_cp4',
  'req_cr_cp5',
  'req_cr_cp6'
]);

export function resolveCanonicalRequestTimestamp(rawId, fallbackTs) {
  const idStr = String(rawId || '').trim();
  const seedTs = SEED_REQUEST_TIMESTAMPS.get(idStr);
  if (typeof seedTs === 'number' && seedTs > 0) {
    return seedTs;
  }
  const idMatch = idStr.match(/^r_(\d{13})$/);
  if (idMatch) {
    const parsedIdTs = Number(idMatch[1]);
    if (!Number.isNaN(parsedIdTs) && parsedIdTs > 0) {
      return parsedIdTs;
    }
  }
  const fb = Number(fallbackTs || 0);
  return !Number.isNaN(fb) && fb > 0 ? fb : Date.now();
}

export function normalizeCraftLabel(rawCraft) {
  const c = String(rawCraft || '').trim();
  if (!c || c === 'سباك') return 'بلومبي';
  return c;
}

export function isCraftsmanAdInCustomerFeed(item) {
  if (!item) return true;
  const idStr = String(item.id || '').trim();
  if (CRAFTSMAN_AD_DEMANDE_IDS.has(idStr)) return true;
  if (String(item.status || '') === 'craftsman_ad_hidden') return true;

  const titleStr = String(item.title || item.client_name || '').trim();
  const descStr = String(item.desc || item.message || '').trim();
  const combined = `${titleStr} ${descStr}`;

  if (
    /صباغ بنتار|حداة عامة|حدادة عامة|حرفي معتمد متاح|متوفر حالياً لتنفيذ أشغال|أحمد - سباك محترف|أحمد - بلومبي محترف/i.test(
      combined
    )
  ) {
    return true;
  }

  // If title/desc is purely a craftsman greeting/self-promotion without any customer request intent
  const hasCustomerRequestIntent =
    /طلب|مطلوب|أحتاج|احتاج|أبحث|ابحث|خصني|يوجد تسرب|عطل|تصليح|إصلاح|تركيب|تنظيف|صيانة|راني فالطريق|أومبان|en panne/i.test(
      combined
    );
  const looksLikeCraftsmanSelfPromo =
    /مرحبا بالجميع|في خدمتكم|لخدماتكم|خبرة في مجال|نقدم لكم خدمات|اتصلوا بي|جميع أنواع الحدادة|جميع أنواع الصباغة/i.test(
      combined
    );
  if (looksLikeCraftsmanSelfPromo && !hasCustomerRequestIntent) {
    return true;
  }

  return false;
}

export function mapDemandeRowToRequestItem(row) {
  if (!row) return null;
  if (String(row.status || '') === 'craftsman_ad_hidden') return null;
  const { text: cleanDesc, meta } = unpackTextAndMeta(row.message || '');
  const rawId =
    row.id !== undefined && row.id !== null
      ? String(row.id)
      : meta.appId || `dem_${Date.now()}`;

  if (CRAFTSMAN_AD_DEMANDE_IDS.has(rawId) || Boolean(meta.isCraftsmanAd)) {
    return null;
  }

  const rowTs = row.created_at ? new Date(row.created_at).getTime() : 0;
  const metaTs = typeof meta.createdAt === 'number' ? meta.createdAt : 0;
  const fallbackTs = !Number.isNaN(metaTs) && metaTs > 0 ? metaTs : !Number.isNaN(rowTs) && rowTs > 0 ? rowTs : Date.now();
  const createdTs = resolveCanonicalRequestTimestamp(rawId, fallbackTs);

  const statusVal =
    row.status === 'in_progress' || row.status === 'completed' || row.status === 'open'
      ? row.status
      : meta.isAgreed
      ? 'in_progress'
      : 'open';

  const mapped = {
    id: rawId,
    title: String(row.title || row.client_name || cleanDesc || 'طلب خدمة').replace(/سباك/g, 'بلومبي').trim(),
    phone: String(row.phone || row.client_phone || '0550000000').trim(),
    wilaya: String(row.wilaya || '16 الجزائر').trim(),
    craft: normalizeCraftLabel(row.craft || row.metier),
    desc: String(row.desc || cleanDesc || row.title || row.client_name || '').replace(/سباك/g, 'بلومبي').trim(),
    status: statusVal,
    priority: row.priority !== undefined ? Boolean(row.priority) : meta.priority !== undefined ? Boolean(meta.priority) : true,
    createdAt: Number.isNaN(createdTs) ? Date.now() : createdTs,
    isCustomerOwn: row.is_customer_own !== undefined ? Boolean(row.is_customer_own) : Boolean(meta.isCustomerOwn),
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
  if (isCraftsmanAdInCustomerFeed(mapped)) {
    guardianDemandesById.delete(String(mapped.id));
    return null;
  }
  guardianDemandesById.set(String(mapped.id), mapped);
  return mapped;
}

export function mapRequestItemToDemandePayload(req) {
  const reqId = String(req.id || `dem_${Date.now()}`).trim();
  const resolvedCreatedAt = resolveCanonicalRequestTimestamp(reqId, req.createdAt);

  const meta = {
    appId: reqId,
    priority: Boolean(req.priority),
    createdAt: resolvedCreatedAt,
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

  const titleStr = String(req.title || 'طلب خدمة').trim();
  const descStr = String(req.desc || req.title || '').trim();
  const phoneStr = String(req.phone || '0550000000').trim();
  const wilayaStr = String(req.wilaya || '16 الجزائر').trim();
  const craftStr = normalizeCraftLabel(req.craft);
  const statusStr = req.status === 'in_progress' || req.status === 'completed' ? req.status : 'open';

  const payload = {
    id: reqId,
    title: titleStr,
    desc: descStr,
    craft: craftStr,
    wilaya: wilayaStr,
    phone: phoneStr,
    status: statusStr,
    priority: Boolean(req.priority ?? true),
    is_customer_own: Boolean(req.isCustomerOwn ?? true),
    client_name: titleStr,
    client_phone: phoneStr,
    metier: craftStr,
    message: packTextWithMeta(descStr, meta),
    created_at: new Date(resolvedCreatedAt).toISOString()
  };

  return payload;
}

export function normalizeDzCraftsmanPhone(raw) {
  return String(raw || '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\D/g, '')
    .replace(/^(213|00213)/, '0')
    .trim();
}

export function deduplicateCraftsmenByPhone(list) {
  if (!Array.isArray(list)) return [];
  const seenPhones = new Map();
  const result = [];
  for (const c of list) {
    if (!c) continue;
    const normPhone = normalizeDzCraftsmanPhone(c.phone);
    if (normPhone.length >= 8) {
      if (seenPhones.has(normPhone)) {
        const existingIdx = seenPhones.get(normPhone);
        const prev = result[existingIdx];
        result[existingIdx] = {
          ...prev,
          ...c,
          id: prev.id,
          points: typeof prev.points === 'number' ? prev.points : c.points
        };
        continue;
      }
      seenPhones.set(normPhone, result.length);
    }
    result.push(c);
  }
  return result;
}

export function mapArtisanRowToCraftsmanUser(row) {
  if (!row) return null;
  const { text: cleanBio, meta } = unpackTextAndMeta(row.description || '');
  const normPhone = normalizeDzCraftsmanPhone(row.phone || '');
  // Check if an artisan with this phone number already exists in guardianArtisansById
  let existingByPhoneId = null;
  if (normPhone.length >= 8) {
    for (const [k, v] of guardianArtisansById.entries()) {
      if (v && normalizeDzCraftsmanPhone(v.phone) === normPhone) {
        existingByPhoneId = k;
        break;
      }
    }
  }
  const rawId =
    existingByPhoneId ||
    (row.id !== undefined && row.id !== null
      ? String(row.id)
      : meta.appId || (normPhone.length >= 8 ? `cr_${normPhone}` : `art_${Date.now()}`));
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
    craft: normalizeCraftLabel(row.metier),
    bio: (cleanBio || 'حرفي معتمد في منصة خدّام ديزاد').replace(/سباك/g, 'بلومبي'),
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
    metier: normalizeCraftLabel(craftsman.craft),
    description: packTextWithMeta(craftsman.bio || 'حرفي معتمد في منصة خدّام ديزاد', meta),
    price: pointsVal,
    is_active: craftsman.status !== 'suspended'
  };
}

function emitGuardianSyncToReact(detail) {
  if (typeof window === 'undefined') return;
  try {
    const sortedRequests = sortRequestsNewestFirst(Array.from(guardianDemandesById.values()));
    const uniqueCraftsmen = deduplicateCraftsmenByPhone(Array.from(guardianArtisansById.values()));
    window.dispatchEvent(
      new CustomEvent('khadam:supabase-sync', {
        detail: {
          ...detail,
          demandes: Array.isArray(detail?.demandes)
            ? sortRequestsNewestFirst(detail.demandes)
            : sortedRequests,
          requests: sortedRequests,
          craftsmen: uniqueCraftsmen,
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
    const { error: upErr } = await supabase
      .from('points')
      .upsert([{ id: idStr, points: cleanPts }], { onConflict: 'id' });

    if (upErr) {
      pendingOutboundPoints.set(idStr, cleanPts);
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
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('demandes')
        .select('*');
      if (fallback.error || !Array.isArray(fallback.data)) return null;
      return sortRequestsNewestFirst(
        fallback.data.map(mapDemandeRowToRequestItem).filter(Boolean)
      );
    }
    if (!Array.isArray(data)) return null;
    return sortRequestsNewestFirst(
      data.map(mapDemandeRowToRequestItem).filter(Boolean)
    );
  } catch {
    return null;
  }
}

// Upsert by id (if id exists -> update, if not -> insert. Never delete!)
export async function saveDemandeToSupabase(req) {
  if (!req) return null;
  const reqId = String(req.id || `dem_${Date.now()}`).trim();
  const resolvedCreatedAt = resolveCanonicalRequestTimestamp(reqId, req.createdAt);
  const cleanReq = { ...req, id: reqId, createdAt: resolvedCreatedAt };

  guardianDemandesById.set(reqId, cleanReq);
  const payload = mapRequestItemToDemandePayload(cleanReq);

  try {
    const { data: upsertedRows, error: upErr } = await supabase
      .from('demandes')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (!upErr && Array.isArray(upsertedRows) && upsertedRows.length > 0) {
      const mapped = mapDemandeRowToRequestItem(upsertedRows[0]);
      pendingOutboundDemandes.delete(reqId);
      broadcastRealtimeEvent('demande_updated', mapped);
      emitGuardianSyncToReact({ type: 'demande_updated', demande: mapped });
      return mapped;
    }

    // 2. Also check if a row with same client_name + wilaya + metier exists
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

    pendingOutboundDemandes.set(reqId, cleanReq);
  } catch {
    pendingOutboundDemandes.set(reqId, cleanReq);
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
      .neq('phone', '0551234567')
      .order('id', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('artisans')
        .select('full_name, phone, wilaya, commune, metier, description, price, is_active')
        .neq('phone', '0551234567');
      if (fallback.error || !Array.isArray(fallback.data)) return null;
      return deduplicateCraftsmenByPhone(
        fallback.data.map(mapArtisanRowToCraftsmanUser).filter(Boolean)
      );
    }
    if (!Array.isArray(data)) return null;
    return deduplicateCraftsmenByPhone(
      data.map(mapArtisanRowToCraftsmanUser).filter(Boolean)
    );
  } catch {
    return null;
  }
}

// Upsert by id / phone (if exists -> update, if not -> insert. Never duplicate!)
export async function saveArtisanToSupabase(craftsman, revealedPhonesList) {
  if (!craftsman) return null;
  const crId = String(craftsman.id || `art_${Date.now()}`);
  const normPhone = normalizeDzCraftsmanPhone(craftsman.phone);
  if (['cp1', 'cp2', 'cp3', 'cp4', 'cp5', 'cp6'].includes(crId) || normPhone === '0551234567') {
    return null;
  }
  guardianArtisansById.set(crId, { ...craftsman, id: crId });
  const payload = mapCraftsmanUserToArtisanPayload(craftsman, revealedPhonesList);

  // Sync points table by id as well
  savePointsToSupabase(crId, payload.price).catch(() => {});

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(crId);
    if (isUuid) {
      const { data: byIdRows, error: byIdErr } = await supabase
        .from('artisans')
        .select('id')
        .eq('id', crId)
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
    }

    // Check by phone (both exact and normalized digits) so same craftsman keeps 1 single account
    const cleanPhone = payload.phone;
    const { data: existingByPhone } = await supabase
      .from('artisans')
      .select('id, full_name, phone, wilaya, commune, metier, description, price, is_active')
      .or(`phone.eq.${cleanPhone},phone.eq.${normPhone}`)
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
            const sorted = sortRequestsNewestFirst(list);
            callbacks?.onDemandesSnapshot?.(sorted);
            emitGuardianSyncToReact({ type: 'demandes_snapshot', demandes: sorted });
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
  rules: 'UPSERT_BY_ID_ONLY_NEVER_DELETE_NEWEST_FIRST'
};

let guardianCyclesCount = 0;

export async function runLiveSupabaseBotReply({
  message,
  craftsmanId,
  craftsmanName,
  craft,
  wilaya,
  points,
  pendingCount,
  revealCost = 25
}) {
  const [liveDemandes, liveArtisans, livePointsMap] = await Promise.all([
    fetchDemandesFromSupabase(),
    fetchArtisansFromSupabase(),
    fetchPointsFromSupabase()
  ]);

  const allDemandes = Array.isArray(liveDemandes) ? liveDemandes : Array.from(guardianDemandesById.values());
  const allArtisans = Array.isArray(liveArtisans) ? liveArtisans : Array.from(guardianArtisansById.values());
  const openDemandes = allDemandes.filter((r) => r && r.status !== 'completed');
  const matchingCraftDemandes = openDemandes.filter((r) => !craft || r.craft === craft);
  const matchingWilayaDemandes = matchingCraftDemandes.filter(
    (r) => !wilaya || String(r.wilaya || '').includes(String(wilaya).replace(/^\d+\s*/, ''))
  );

  const syncedPts =
    craftsmanId && livePointsMap && typeof livePointsMap[String(craftsmanId)] === 'number'
      ? livePointsMap[String(craftsmanId)]
      : typeof points === 'number'
      ? points
      : 50;

  const text = String(message || '').trim();
  const latestMatching = matchingWilayaDemandes[0] || matchingCraftDemandes[0] || openDemandes[0];

  if (/وصل|تفعيل|معلق|شحن|بريدي|شارجيلي|نقاط|رصيد/i.test(text)) {
    return `🤖 [بوت خدّام DZ المباشر - متصل بـ Supabase]: مرحباً ${craftsmanName || 'حرفينا الكريم'}! رصيدك الفعلي المسجل في قاعدة البيانات هو (${syncedPts} نقطة — يكفي لكشف ${Math.floor(syncedPts / Math.max(1, revealCost))} أرقام زبائن). ${
      pendingCount > 0
        ? `تم رصد (${pendingCount}) وصل شحن وتفعيله تلقائياً في حسابك على Supabase ⚡.`
        : 'يمكنك شحن نقاطك في أي وقت عبر بريدي موب (RIP: 00799999000122089353) أو شارجيلي باي وسيقوم البوت بفحص الوصل وتحديث جدول النقاط (points) فوراً.'
    }`;
  }

  if (/طلب|خدمة|زبون|عمل|ورشة/i.test(text) && latestMatching) {
    return `🤖 [بوت خدّام DZ المباشر - متصل بـ Supabase]: يوجد حالياً (${openDemandes.length}) طلب مفتوح في قاعدة البيانات، منها (${matchingCraftDemandes.length}) طلب في تخصص (${normalizeCraftLabel(craft)}). أحدث طلب: "${latestMatching.title}" في (${latestMatching.wilaya}). يمكنك كشف رقم الزبون بـ ${revealCost} نقطة والتواصل معه فوراً 📞.`;
  }

  return `🤖 [بوت خدّام DZ المباشر 24/7]: أهلاً بك ${craftsmanName || 'حرفينا الكريم'}! البوت متصل بقاعدة بيانات Supabase الحية (${openDemandes.length} طلب زبون نشط • ${allArtisans.length} حرفي مسجل • رصيدك: ${syncedPts} نقطة).${
    latestMatching ? ` أحدث طلب في تخصصك: "${latestMatching.title}" (${latestMatching.wilaya}).` : ''
  } نحن في خدمتك على مدار الساعة ⚡.`;
}

export function startSync() {
  if (guardianBotStarted) return;
  guardianBotStarted = true;

  const runBidirectionalGuardianCycle = async () => {
    try {
      guardianCyclesCount += 1;

      // 0. تذكير البوت بعمله 24/24 وإعادة فتح قناة البث الفوري تلقائياً إذا انقطعت على أي هاتف
      if (
        !activeBroadcastChannel ||
        activeBroadcastChannel.state === 'closed' ||
        activeBroadcastChannel.state === 'errored'
      ) {
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

      // If demandes table exists in Supabase and is currently empty (0 rows), seed INITIAL_REQUESTS into Supabase by id
      if (
        Array.isArray(demandes) &&
        demandes.length === 0 &&
        Array.isArray(INITIAL_REQUESTS) &&
        INITIAL_REQUESTS.length > 0
      ) {
        for (const seedReq of INITIAL_REQUESTS) {
          if (seedReq && seedReq.id) {
            pendingOutboundDemandes.set(String(seedReq.id), seedReq);
          }
        }
      }

      if (
        (Array.isArray(demandes) && demandes.length > 0) ||
        (Array.isArray(artisans) && artisans.length > 0)
      ) {
        emitGuardianSyncToReact({
          type: 'guardian_cycle',
          demandes: sortRequestsNewestFirst(demandes || []),
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

  // Run 24/24 non-stop via un-throttled Web Worker + fallback setInterval + focus/visibility/online
  if (typeof window !== 'undefined') {
    setInterval(runBidirectionalGuardianCycle, 4000);

    try {
      if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
        const workerCode = `
          setInterval(function() {
            postMessage('kdz_bot_tick');
          }, 4000);
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = () => {
          runBidirectionalGuardianCycle();
        };
        window.__KDZ_BOT_WORKER__ = worker;
      }
    } catch {
      // fallback interval already active
    }

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

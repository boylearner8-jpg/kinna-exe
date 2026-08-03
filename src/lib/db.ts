import { supabase } from './supabase';

// ══════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════

export interface GalleryMemory {
  id: string;
  image: string;        // public URL (Supabase Storage) or /path for seeds
  memoryText: string;
  date?: string;
  tag?: string;
  isPublic?: boolean;
  created_at?: string;
}

export interface JourneyReply {
  id: string;
  comment_id: string;
  name: string;
  reply: string;
  date: string;
  time: string;
  created_at: string;
}

export interface JourneyComment {
  id: string;
  name: string;
  comment: string;
  date: string;
  time: string;
  created_at: string;
  replies?: JourneyReply[];
}

export interface GuestbookReply {
  id: string;
  message_id: string;
  name: string;
  reply: string;
  date: string;
  time: string;
  created_at: string;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  message: string;
  date: string;
  time: string;
  created_at: string;
  replies?: GuestbookReply[];
}

export interface TitanScore {
  id: string;
  player_name: string;
  score: number;
  high_score: number;
  wave_reached: number;
  created_at?: string;
}

export interface HorseRunnerScore {
  id: string;
  player_name: string;
  score: number;
  high_score: number;
  character_name?: string;
  created_at?: string;
}


// ══════════════════════════════════════════════
// GALLERY MEMORIES
// ══════════════════════════════════════════════

export async function fetchGalleryMemories(): Promise<GalleryMemory[]> {
  const { data, error } = await supabase
    .from('gallery_memories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery memories:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    image: row.image_url,
    memoryText: row.memory_text,
    date: row.date ?? undefined,
    tag: row.tag ?? undefined,
    isPublic: row.is_public ?? false,
    created_at: row.created_at,
  }));
}

export async function insertGalleryMemory(
  memory: Omit<GalleryMemory, 'created_at'>,
  imageFile?: File
): Promise<GalleryMemory | null> {
  let imageUrl = memory.image;

  // Upload file to Supabase Storage if a file object was provided
  if (imageFile) {
    const fileName = `${memory.id}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, imageFile, { upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      // Fall back to base64 data URL if storage fails
      imageUrl = memory.image;
    } else {
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('gallery_memories')
    .insert({
      id: memory.id,
      image_url: imageUrl,
      memory_text: memory.memoryText,
      date: memory.date ?? null,
      tag: memory.tag ?? null,
      is_public: memory.isPublic ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting gallery memory:', error.message);
    return null;
  }

  return {
    id: data.id,
    image: data.image_url,
    memoryText: data.memory_text,
    date: data.date ?? undefined,
    tag: data.tag ?? undefined,
    isPublic: data.is_public ?? false,
    created_at: data.created_at,
  };
}

export async function deleteGalleryMemory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('gallery_memories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gallery memory:', error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════
// JOURNEY COMMENTS
// ══════════════════════════════════════════════

export async function fetchJourneyComments(): Promise<JourneyComment[]> {
  const { data: commentsData, error: e1 } = await supabase
    .from('journey_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (e1) {
    console.error('Error fetching journey comments:', e1.message);
    return [];
  }

  // Fetch replies (gracefully handles if table is created later)
  let repliesData: any[] = [];
  try {
    const { data: rd, error: e2 } = await supabase
      .from('journey_replies')
      .select('*')
      .order('created_at', { ascending: true });
    if (!e2 && rd) repliesData = rd;
  } catch (err) {
    /* fallback empty */
  }

  const repliesByCommentId: Record<string, JourneyReply[]> = {};
  repliesData.forEach((r: any) => {
    if (!repliesByCommentId[r.comment_id]) repliesByCommentId[r.comment_id] = [];
    repliesByCommentId[r.comment_id].push({
      id: r.id,
      comment_id: r.comment_id,
      name: r.name,
      reply: r.reply,
      date: r.date,
      time: r.time,
      created_at: r.created_at,
    });
  });

  return (commentsData ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    comment: row.comment,
    date: row.date,
    time: row.time,
    created_at: row.created_at,
    replies: repliesByCommentId[row.id] || [],
  }));
}

export async function insertJourneyReply(
  reply: Omit<JourneyReply, 'created_at'>
): Promise<JourneyReply | null> {
  const { data, error } = await supabase
    .from('journey_replies')
    .insert({
      id: reply.id,
      comment_id: reply.comment_id,
      name: reply.name,
      reply: reply.reply,
      date: reply.date,
      time: reply.time,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting journey reply:', error.message);
    return null;
  }

  return {
    id: data.id,
    comment_id: data.comment_id,
    name: data.name,
    reply: data.reply,
    date: data.date,
    time: data.time,
    created_at: data.created_at,
  };
}

export async function deleteJourneyReply(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('journey_replies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journey reply:', error.message);
    return false;
  }
  return true;
}

export async function insertJourneyComment(
  comment: Omit<JourneyComment, 'created_at'>
): Promise<JourneyComment | null> {
  const { data, error } = await supabase
    .from('journey_comments')
    .insert({
      id: comment.id,
      name: comment.name,
      comment: comment.comment,
      date: comment.date,
      time: comment.time,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting journey comment:', error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    comment: data.comment,
    date: data.date,
    time: data.time,
    created_at: data.created_at,
  };
}

export async function deleteJourneyComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('journey_comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journey comment:', error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════
// GUESTBOOK MESSAGES
// ══════════════════════════════════════════════

export async function fetchGuestbookMessages(): Promise<GuestbookMessage[]> {
  const { data: msgData, error: e1 } = await supabase
    .from('guestbook_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (e1) {
    console.error('Error fetching guestbook messages:', e1.message);
    return [];
  }

  // Fetch guestbook replies (gracefully handles missing table)
  let repliesData: any[] = [];
  try {
    const { data: rd, error: e2 } = await supabase
      .from('guestbook_replies')
      .select('*')
      .order('created_at', { ascending: true });
    if (!e2 && rd) repliesData = rd;
  } catch (err) {
    /* fallback empty */
  }

  const repliesByMessageId: Record<string, GuestbookReply[]> = {};
  repliesData.forEach((r: any) => {
    if (!repliesByMessageId[r.message_id]) repliesByMessageId[r.message_id] = [];
    repliesByMessageId[r.message_id].push({
      id: r.id,
      message_id: r.message_id,
      name: r.name,
      reply: r.reply,
      date: r.date,
      time: r.time,
      created_at: r.created_at,
    });
  });

  return (msgData ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    message: row.message,
    date: row.date,
    time: row.time,
    created_at: row.created_at,
    replies: repliesByMessageId[row.id] || [],
  }));
}

export async function insertGuestbookReply(
  reply: Omit<GuestbookReply, 'created_at'>
): Promise<GuestbookReply | null> {
  const { data, error } = await supabase
    .from('guestbook_replies')
    .insert({
      id: reply.id,
      message_id: reply.message_id,
      name: reply.name,
      reply: reply.reply,
      date: reply.date,
      time: reply.time,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting guestbook reply:', error.message);
    return null;
  }

  return {
    id: data.id,
    message_id: data.message_id,
    name: data.name,
    reply: data.reply,
    date: data.date,
    time: data.time,
    created_at: data.created_at,
  };
}

export async function deleteGuestbookReply(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('guestbook_replies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting guestbook reply:', error.message);
    return false;
  }
  return true;
}

export async function insertGuestbookMessage(
  msg: Omit<GuestbookMessage, 'created_at'>
): Promise<GuestbookMessage | null> {
  const { data, error } = await supabase
    .from('guestbook_messages')
    .insert({
      id: msg.id,
      name: msg.name,
      message: msg.message,
      date: msg.date,
      time: msg.time,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting guestbook message:', error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    message: data.message,
    date: data.date,
    time: data.time,
    created_at: data.created_at,
  };
}

export async function deleteGuestbookMessage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('guestbook_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting guestbook message:', error.message);
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════
// SEED DATA: Upsert hardcoded entries if table is empty
// ══════════════════════════════════════════════

export async function seedTableIfEmpty(
  tableName: 'gallery_memories' | 'journey_comments' | 'guestbook_messages',
  seedData: any[]
): Promise<void> {
  const { count } = await supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) === 0) {
    const { error } = await supabase.from(tableName).insert(seedData);
    if (error) {
      console.warn(`Seed failed for ${tableName}:`, error.message);
    }
  }
}

// ══════════════════════════════════════════════
// ONE-TIME MIGRATION: localStorage → Supabase
// ══════════════════════════════════════════════

const MIGRATION_FLAG = 'kinna_supabase_migrated_v1';

export async function migrateLocalStorageToSupabase(): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  try {
    // Migrate gallery user memories (non-seed items)
    const galleryRaw = localStorage.getItem('kinna_gallery_memories_v2');
    if (galleryRaw) {
      const items = JSON.parse(galleryRaw) as any[];
      const userItems = items.filter((m) => m.isPublic === true);
      for (const m of userItems) {
        await supabase.from('gallery_memories').upsert({
          id: m.id,
          image_url: m.image,
          memory_text: m.memoryText,
          date: m.date ?? null,
          tag: m.tag ?? null,
          is_public: true,
        });
      }
    }

    // Migrate journey comments (non-seed items)
    const commentsRaw = localStorage.getItem('kinna_journey_comments_v1');
    if (commentsRaw) {
      const items = JSON.parse(commentsRaw) as any[];
      const userItems = items.filter((c) => c.id.startsWith('jcom-') && c.id !== 'jcom-1' && c.id !== 'jcom-2');
      for (const c of userItems) {
        await supabase.from('journey_comments').upsert({
          id: c.id,
          name: c.name,
          comment: c.comment,
          date: c.date,
          time: c.time,
          created_at: c.created_at,
        });
      }
    }

    // Migrate guestbook messages (non-seed items)
    const messagesRaw = localStorage.getItem('kinna_guestbook_messages_v2');
    if (messagesRaw) {
      const items = JSON.parse(messagesRaw) as any[];
      const userItems = items.filter((m) => !m.id.startsWith('msg-seed-'));
      for (const m of userItems) {
        await supabase.from('guestbook_messages').upsert({
          id: m.id,
          name: m.name,
          message: m.message,
          date: m.date,
          time: m.time,
          created_at: m.created_at,
        });
      }
    }

    localStorage.setItem(MIGRATION_FLAG, '1');
    console.log('✅ localStorage migration to Supabase complete.');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// ══════════════════════════════════════════════
// TITAN ARCADE LEADERBOARD
// ══════════════════════════════════════════════

const LOCAL_LEADERBOARD_KEY = 'kinna_titan_leaderboard_v2';

export async function fetchTitanLeaderboard(): Promise<TitanScore[]> {
  try {
    const { data, error } = await supabase
      .from('titan_scores')
      .select('*')
      .order('high_score', { ascending: false })
      .limit(20);

    if (error) throw error;
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetchTitanLeaderboard failed, falling back to localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (raw) {
      return JSON.parse(raw) as TitanScore[];
    }
  } catch {}

  // Return empty array when no scores recorded yet
  return [];
}

export async function saveTitanScore(playerName: string, finalScore: number, waveReached: number): Promise<void> {
  const newEntry: TitanScore = {
    id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    player_name: playerName.trim() || 'Kinna Operative',
    score: finalScore,
    high_score: finalScore,
    wave_reached: waveReached,
    created_at: new Date().toISOString(),
  };

  // 1. Try to save to Supabase
  try {
    await supabase.from('titan_scores').insert({
      id: newEntry.id,
      player_name: newEntry.player_name,
      score: newEntry.score,
      high_score: newEntry.high_score,
      wave_reached: newEntry.wave_reached,
      created_at: newEntry.created_at,
    });
  } catch (err) {
    console.warn('Supabase saveTitanScore failed:', err);
  }

  // 2. Save locally
  try {
    const existing = await fetchTitanLeaderboard();
    // Filter duplicates by player_name and score
    const isDuplicate = existing.some(
      (e) => e.player_name === newEntry.player_name && e.high_score === newEntry.high_score
    );
    if (!isDuplicate) {
      const updated = [...existing, newEntry]
        .sort((a, b) => b.high_score - a.high_score)
        .slice(0, 50);
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updated));
    }
  } catch {}
}

export async function clearTitanLeaderboard(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
    localStorage.removeItem('kinna_titan_leaderboard_v1');
    localStorage.removeItem('kinna_titan_highscore');
  } catch {}

  try {
    await supabase.from('titan_scores').delete().like('id', 'ts-%');
  } catch (err) {
    console.warn('Failed to clear Supabase titan_scores:', err);
  }
}

// ══════════════════════════════════════════════
// HORSE RUNNER LEADERBOARD (GLOBAL SUPABASE SYNC)
// ══════════════════════════════════════════════

const LOCAL_HORSE_LEADERBOARD_KEY = 'kinna_horse_leaderboard_v1';

export async function fetchHorseRunnerLeaderboard(): Promise<HorseRunnerScore[]> {
  try {
    const { data, error } = await supabase
      .from('titan_scores')
      .select('*')
      .like('id', 'hr-%')
      .order('high_score', { ascending: false })
      .limit(20);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        player_name: d.player_name,
        score: d.score,
        high_score: d.high_score,
        character_name: d.wave_reached ? `Character #${d.wave_reached}` : 'Horse Rider',
        created_at: d.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase fetchHorseRunnerLeaderboard failed, falling back to localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_HORSE_LEADERBOARD_KEY);
    if (raw) {
      return JSON.parse(raw) as HorseRunnerScore[];
    }
  } catch {}

  return [];
}

export async function saveHorseRunnerScore(
  playerName: string,
  finalScore: number,
  characterName?: string
): Promise<void> {
  const nameWithChar = characterName
    ? `${playerName.trim() || 'Kinna Runner'} (${characterName})`
    : (playerName.trim() || 'Kinna Runner');

  const newEntry: HorseRunnerScore = {
    id: `hr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    player_name: nameWithChar,
    score: finalScore,
    high_score: finalScore,
    character_name: characterName || 'Horse Rider',
    created_at: new Date().toISOString(),
  };

  // 1. Save to Supabase (titan_scores table)
  try {
    await supabase.from('titan_scores').insert({
      id: newEntry.id,
      player_name: newEntry.player_name,
      score: newEntry.score,
      high_score: newEntry.high_score,
      wave_reached: 1,
      created_at: newEntry.created_at,
    });
    console.log('✅ Horse runner score saved to Supabase globally:', newEntry);
  } catch (err) {
    console.warn('Supabase saveHorseRunnerScore failed:', err);
  }

  // 2. Save locally
  try {
    const existing = await fetchHorseRunnerLeaderboard();
    const isDuplicate = existing.some(
      (e) => e.player_name === newEntry.player_name && e.high_score === newEntry.high_score
    );
    if (!isDuplicate) {
      const updated = [...existing, newEntry]
        .sort((a, b) => b.high_score - a.high_score)
        .slice(0, 50);
      localStorage.setItem(LOCAL_HORSE_LEADERBOARD_KEY, JSON.stringify(updated));
    }
  } catch {}
}

export async function clearHorseRunnerLeaderboard(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_HORSE_LEADERBOARD_KEY);
    localStorage.removeItem('kinna_dino_highscore');
  } catch {}

  try {
    await supabase.from('titan_scores').delete().like('id', 'hr-%');
  } catch (err) {
    console.warn('Failed to clear Supabase horse_runner_scores:', err);
  }
}


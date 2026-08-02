import { supabase } from './supabase';

export interface ToastNotification {
  id: string;
  name: string;
  message: string;
  commentSnippet?: string;
  timestamp: number;
}

type ToastCallback = (toast: ToastNotification) => void;

let listeners: ToastCallback[] = [];
let channel: any = null;

export function subscribeToCommentToasts(callback: ToastCallback): () => void {
  listeners.push(callback);

  if (!channel) {
    channel = supabase.channel('kinna_toasts', {
      config: {
        broadcast: { self: true },
      },
    });

    // 1. Listen for broadcast events from any active tab/user
    channel.on('broadcast', { event: 'new_comment' }, (payload: any) => {
      const name = payload.payload?.name || 'Operative';
      const commentSnippet = payload.payload?.commentSnippet || '';
      const toast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        message: `${name} just left a comment!`,
        commentSnippet,
        timestamp: Date.now(),
      };
      listeners.forEach((fn) => fn(toast));
    });

    // 2. Listen for Postgres changes on journey_comments table (if enabled in Supabase)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'journey_comments' },
      (payload: any) => {
        const name = payload.new?.name || 'Operative';
        const commentSnippet = payload.new?.comment || '';
        const toast: ToastNotification = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          message: `${name} just left a comment!`,
          commentSnippet,
          timestamp: Date.now(),
        };
        listeners.forEach((fn) => fn(toast));
      }
    );

    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Realtime toast notification channel active');
      }
    });
  }

  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
  };
}

export function broadcastNewComment(name: string, commentSnippet?: string) {
  if (channel) {
    channel.send({
      type: 'broadcast',
      event: 'new_comment',
      payload: { name, commentSnippet },
    });
  }
}

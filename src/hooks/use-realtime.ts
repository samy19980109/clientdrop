'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeTableOptions<T extends { id: string; created_at: string }> {
  table: string;
  filterColumn: string;
  filterValue: string;
  initialData: T[];
  events?: EventType[];
  orderDirection?: 'asc' | 'desc';
}

let channelCounter = 0;

export function useRealtimeTable<T extends { id: string; created_at: string }>({
  table,
  filterColumn,
  filterValue,
  initialData,
  events = ['INSERT'],
  orderDirection = 'desc',
}: UseRealtimeTableOptions<T>): T[] {
  const [items, setItems] = useState<T[]>(initialData);

  // Stabilize the events array so it doesn't cause re-subscriptions every render
  const eventsKey = events.join(',');

  // Sync local state when server props change (after router.refresh())
  const fingerprint = useMemo(
    () => initialData.map((d) => d.id).join('|'),
    [initialData]
  );

  useEffect(() => {
    setItems(initialData);
  }, [fingerprint]);

  // Store orderDirection in a ref so the callback always has the latest value
  const orderRef = useRef(orderDirection);
  orderRef.current = orderDirection;

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = createClient();

    // Unique channel name to avoid conflicts with React Strict Mode double-mount
    channelCounter++;
    const channelName = `rt-${table}-${filterValue}-${channelCounter}`;
    const currentEvents = eventsKey.split(',') as EventType[];
    const filter = `${filterColumn}=eq.${filterValue}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel = supabase.channel(channelName) as any;

    for (const event of currentEvents) {
      channel = channel.on(
        'postgres_changes',
        { event, schema: 'public', table, filter },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as T;
            setItems((prev) => {
              if (prev.some((item) => item.id === newItem.id)) return prev;
              return orderRef.current === 'asc'
                ? [...prev, newItem]
                : [newItem, ...prev];
            });
          }

          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id;
            setItems((prev) => prev.filter((item) => item.id !== oldId));
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as T;
            setItems((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          }
        }
      );
    }

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, filterColumn, filterValue, eventsKey]);

  return items;
}

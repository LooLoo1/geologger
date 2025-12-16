import { supabase } from '@lib/supabase';
import { getSupabaseData } from '@lib/supabase.helpers';
import type { CreateLocationData, LocationLogResponse, SupabaseLocationLog } from './location.types';

export class LocationRepository {
  async create(data: CreateLocationData): Promise<LocationLogResponse> {
    const supabaseData = {
      user_id: data.userId,
      lat: data.lat,
      lng: data.lng,
      altitude: data.altitude ?? null,
      timestamp: data.timestamp ? data.timestamp.toISOString() : new Date().toISOString(),
      synced: true,
    };

    const response = await supabase
      .from('location_logs')
      .insert(supabaseData)
      .select('*')
      .single();

    const created = getSupabaseData(response);
    return this.toResponse(created);
  }

  async findByUserId(userId: string): Promise<LocationLogResponse[]> {
    const response = await supabase
      .from('location_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    const locations = getSupabaseData(response);
    return locations.map((loc) => this.toResponse(loc));
  }

  async createMany(locations: CreateLocationData[]): Promise<LocationLogResponse[]> {
    if (locations.length === 0) {
      return [];
    }

    const supabaseData = locations.map((loc) => ({
      user_id: loc.userId,
      lat: loc.lat,
      lng: loc.lng,
      altitude: loc.altitude ?? null,
      timestamp: loc.timestamp ? loc.timestamp.toISOString() : new Date().toISOString(),
      synced: true,
    }));

    const response = await supabase
      .from('location_logs')
      .insert(supabaseData)
      .select('*');

    const created = getSupabaseData(response);
    return created.map((loc) => this.toResponse(loc));
  }

  private toResponse(location: SupabaseLocationLog): LocationLogResponse {
    return {
      id: location.id,
      userId: location.user_id,
      lat: location.lat,
      lng: location.lng,
      ...(location.altitude !== null && { altitude: location.altitude }),
      timestamp: location.timestamp,
    };
  }
}



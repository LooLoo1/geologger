export interface LocationLog {
    userId: string;
    lat: number;
    lng: number;
    altitude?: number; // додали висоту
    timestamp: string; // ISO
  }
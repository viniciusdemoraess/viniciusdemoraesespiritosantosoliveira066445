export interface User {
  username: string;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
}

export interface Artist {
  id: number;
  name: string;
  artistType?: string;
  country?: string;
  biography?: string;
  albumCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistSummary {
  id: number;
  name: string;
  artistType?: string;
  country?: string;
}

export interface Album {
  id: number;
  title: string;
  releaseYear: number;
  genre?: string;
  recordLabel?: string;
  totalTracks?: number;
  totalDurationSeconds?: number;
  artistId: number; // Deprecated, use artists
  artistName: string; // Deprecated, use artists
  artists: ArtistSummary[];
  covers: AlbumCover[];
  createdAt: string;
  updatedAt: string;
}

export interface AlbumCover {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

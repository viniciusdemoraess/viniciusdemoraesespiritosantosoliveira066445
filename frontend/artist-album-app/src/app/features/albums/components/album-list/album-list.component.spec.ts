import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { AlbumListComponent } from './album-list.component';
import { AlbumService } from '../../../../core/services/album.service';
import { ArtistService } from '../../../../core/services/artist.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { Album, Artist, Page } from '../../../../core/models';

describe('AlbumListComponent', () => {
  let component: AlbumListComponent;
  let fixture: ComponentFixture<AlbumListComponent>;
  let mockAlbumService: jasmine.SpyObj<AlbumService>;
  let mockArtistService: jasmine.SpyObj<ArtistService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockWebsocketService: jasmine.SpyObj<WebsocketService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockAlbums: Album[] = [
    {
      id: 1,
      title: 'Harakiri',
      artistId: 1,
      artistName: 'Serj Tankian',
      releaseYear: 2012,
      coverUrls: ['cover1.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockArtists: Artist[] = [
    { id: 1, name: 'Serj Tankian', bio: 'Musician', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockAlbumPage: Page<Album> = {
    content: mockAlbums,
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0
  };

  const mockArtistPage: Page<Artist> = {
    content: mockArtists,
    totalElements: 1,
    totalPages: 1,
    size: 100,
    number: 0
  };

  beforeEach(async () => {
    const websocketSubject = new Subject<any>();

    mockAlbumService = jasmine.createSpyObj('AlbumService', ['getAll', 'create', 'update', 'delete', 'uploadCovers']);
    mockArtistService = jasmine.createSpyObj('ArtistService', ['getAll']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockWebsocketService = jasmine.createSpyObj('WebsocketService', ['watch'], {
      connected$: of(true)
    });
    mockWebsocketService.watch.and.returnValue(websocketSubject.asObservable());
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: of({ artistId: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [AlbumListComponent, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: AlbumService, useValue: mockAlbumService },
        { provide: ArtistService, useValue: mockArtistService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: WebsocketService, useValue: mockWebsocketService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load albums and artists on init', () => {
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.ngOnInit();

    expect(mockAlbumService.getAll).toHaveBeenCalled();
    expect(mockArtistService.getAll).toHaveBeenCalled();
    expect(component.albums.length).toBe(1);
    expect(component.artists.length).toBe(1);
  });

  it('should filter albums by artistId from query params', () => {
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.ngOnInit();

    expect(component.filterArtistId).toBe(1);
    expect(mockAlbumService.getAll).toHaveBeenCalledWith(0, 12, 1);
  });

  it('should create new album', () => {
    const newAlbum: Album = {
      id: 2,
      title: 'New Album',
      artistId: 1,
      artistName: 'Serj Tankian',
      releaseYear: 2023,
      coverUrls: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAlbumService.create.and.returnValue(of(newAlbum));
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.selectedAlbum = { title: 'New Album', artistId: 1, releaseYear: 2023 };
    component.createAlbum();

    expect(mockAlbumService.create).toHaveBeenCalled();
    expect(component.showModal).toBe(false);
  });

  it('should update existing album', () => {
    const updatedAlbum: Album = {
      id: 1,
      title: 'Updated Album',
      artistId: 1,
      artistName: 'Serj Tankian',
      releaseYear: 2023,
      coverUrls: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAlbumService.update.and.returnValue(of(updatedAlbum));
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.selectedAlbum = updatedAlbum;
    component.isEditMode = true;
    component.updateAlbum();

    expect(mockAlbumService.update).toHaveBeenCalledWith(1, updatedAlbum);
  });

  it('should delete album after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockAlbumService.delete.and.returnValue(of(void 0));
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.deleteAlbum(1);

    expect(mockAlbumService.delete).toHaveBeenCalledWith(1);
  });

  it('should handle file selection', () => {
    const mockFile = new File(['content'], 'cover.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelect(mockEvent);

    expect(component.selectedFiles.length).toBe(1);
    expect(component.selectedFiles[0]).toBe(mockFile);
  });

  it('should upload covers', () => {
    const mockFiles = [new File(['content'], 'cover.jpg', { type: 'image/jpeg' })];
    const mockResponse = { coverUrls: ['uploaded-cover.jpg'] };

    mockAlbumService.uploadCovers.and.returnValue(of(mockResponse));
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.selectedAlbumId = 1;
    component.selectedFiles = mockFiles;
    component.uploadCovers();

    expect(mockAlbumService.uploadCovers).toHaveBeenCalledWith(1, mockFiles);
    expect(component.showUploadModal).toBe(false);
  });

  it('should handle WebSocket notifications', () => {
    const websocketSubject = new Subject<any>();
    mockWebsocketService.watch.and.returnValue(websocketSubject.asObservable());
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.ngOnInit();

    // Simulate WebSocket message
    websocketSubject.next({ type: 'ALBUM_CREATED', albumId: 2 });

    expect(mockAlbumService.getAll).toHaveBeenCalled();
  });

  it('should navigate back to artists', () => {
    component.navigateToArtists();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/artists']);
  });

  it('should logout successfully', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should handle pagination', () => {
    mockAlbumService.getAll.and.returnValue(of(mockAlbumPage));
    mockArtistService.getAll.and.returnValue(of(mockArtistPage));

    component.currentPage = 0;
    component.totalPages = 3;

    component.nextPage();

    expect(component.currentPage).toBe(1);
  });
});

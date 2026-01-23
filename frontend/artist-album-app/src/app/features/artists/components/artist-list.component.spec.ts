import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArtistListComponent } from './artist-list.component';
import { ArtistFacadeService } from '../../../core/facades/artist-facade.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { Artist } from '../../../core/models';

describe('ArtistListComponent', () => {
  let component: ArtistListComponent;
  let fixture: ComponentFixture<ArtistListComponent>;
  let artistFacadeService: jasmine.SpyObj<ArtistFacadeService>;
  let router: jasmine.SpyObj<Router>;

  const mockArtists: Artist[] = [
    { id: 1, name: 'Artist A', albumCount: 3, createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00' }
  ];

  beforeEach(async () => {
    const artistsSubject = new BehaviorSubject<Artist[]>(mockArtists);
    const loadingSubject = new BehaviorSubject<boolean>(false);

    const artistFacadeSpy = jasmine.createSpyObj('ArtistFacadeService', [
      'loadArtists',
      'createArtist',
      'updateArtist',
      'deleteArtist'
    ], {
      artists$: artistsSubject.asObservable(),
      loading$: loadingSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        ArtistListComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ArtistFacadeService, useValue: artistFacadeSpy }
      ]
    }).compileComponents();

    artistFacadeService = TestBed.inject(ArtistFacadeService) as jasmine.SpyObj<ArtistFacadeService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ArtistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load artists on init', () => {
    expect(artistFacadeService.loadArtists).toHaveBeenCalled();
  });

  it('should filter artists by name', () => {
    component.searchTerm = 'Artist A';
    component.onSearch();
    expect(component.allArtists.length).toBeGreaterThan(0);
  });

  it('should clear search', () => {
    component.searchTerm = 'test';
    component.clearSearch();
    expect(component.searchTerm).toBe('');
  });

  it('should show clear filters button when filters are active', () => {
    component.searchTerm = 'test';
    expect(component.showClearFiltersButton).toBe(true);
  });

  it('should clear all filters', () => {
    component.searchTerm = 'test';
    component.sortDirection = 'desc';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.sortDirection).toBe('asc');
  });

  it('should navigate to albums page', () => {
    component.viewAlbums(1);
    expect(router.navigate).toHaveBeenCalledWith(['/albums'], { queryParams: { artistId: 1 } });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ArtistListComponent } from './artist-list.component';
import { ArtistService } from '../../../core/services/artist.service';
import { AuthService } from '../../../core/services/auth.service';
import { Artist, Page } from '../../../core/models';

describe('ArtistListComponent', () => {
  let component: ArtistListComponent;
  let fixture: ComponentFixture<ArtistListComponent>;
  let mockArtistService: jasmine.SpyObj<ArtistService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockArtists: Artist[] = [
    { id: 1, name: 'Serj Tankian', bio: 'Musician', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Mike Shinoda', bio: 'Artist', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockPage: Page<Artist> = {
    content: mockArtists,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0
  };

  beforeEach(async () => {
    mockArtistService = jasmine.createSpyObj('ArtistService', ['getAll', 'create', 'update', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ArtistListComponent, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: ArtistService, useValue: mockArtistService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load artists on init', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));

    component.ngOnInit();

    expect(mockArtistService.getAll).toHaveBeenCalledWith(0, 10, '', 'name,asc');
    expect(component.artists.length).toBe(2);
    expect(component.totalPages).toBe(1);
  });

  it('should handle pagination', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));
    component.currentPage = 0;
    component.totalPages = 3;

    component.nextPage();

    expect(component.currentPage).toBe(1);
    expect(mockArtistService.getAll).toHaveBeenCalledWith(1, 10, '', 'name,asc');
  });

  it('should not go beyond last page', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));
    component.currentPage = 2;
    component.totalPages = 3;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should go to previous page', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));
    component.currentPage = 1;

    component.previousPage();

    expect(component.currentPage).toBe(0);
    expect(mockArtistService.getAll).toHaveBeenCalled();
  });

  it('should not go below first page', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));
    component.currentPage = 0;

    component.previousPage();

    expect(component.currentPage).toBe(0);
  });

  it('should apply search filter', () => {
    mockArtistService.getAll.and.returnValue(of(mockPage));
    component.searchTerm = 'Serj';

    component.applySearch();

    expect(component.currentPage).toBe(0);
    expect(mockArtistService.getAll).toHaveBeenCalledWith(0, 10, 'Serj', 'name,asc');
  });

  it('should create new artist', () => {
    const newArtist: Artist = {
      id: 3,
      name: 'New Artist',
      bio: 'Bio',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockArtistService.create.and.returnValue(of(newArtist));
    mockArtistService.getAll.and.returnValue(of(mockPage));

    component.selectedArtist = { name: 'New Artist', bio: 'Bio' };
    component.createArtist();

    expect(mockArtistService.create).toHaveBeenCalled();
    expect(component.showModal).toBe(false);
    expect(mockArtistService.getAll).toHaveBeenCalled();
  });

  it('should update existing artist', () => {
    const updatedArtist: Artist = {
      id: 1,
      name: 'Updated Name',
      bio: 'Updated Bio',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockArtistService.update.and.returnValue(of(updatedArtist));
    mockArtistService.getAll.and.returnValue(of(mockPage));

    component.selectedArtist = updatedArtist;
    component.isEditMode = true;
    component.updateArtist();

    expect(mockArtistService.update).toHaveBeenCalledWith(1, updatedArtist);
    expect(component.showModal).toBe(false);
  });

  it('should delete artist after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockArtistService.delete.and.returnValue(of(void 0));
    mockArtistService.getAll.and.returnValue(of(mockPage));

    component.deleteArtist(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockArtistService.delete).toHaveBeenCalledWith(1);
  });

  it('should not delete artist if confirmation cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteArtist(1);

    expect(mockArtistService.delete).not.toHaveBeenCalled();
  });

  it('should logout successfully', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchSettingsPage } from './search-settings.page';

describe('SearchSettingsPage', () => {
  let component: SearchSettingsPage;
  let fixture: ComponentFixture<SearchSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

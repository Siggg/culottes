import { AppPage } from './app.po';

describe('angular-truffle-box App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the criteria label', () => {
    page.navigateTo();
    expect(page.getCriteriaLabel()).toContain('They get an income if and only if they are');
  });

  it('should display the criteria question', () => {
    page.navigateTo();
    // expect(page.getCriteria()).toContain('frequent contributor to open source projects');
  });
});

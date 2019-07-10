import { AppPage } from './app.po';

describe('angular-truffle-box App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the criteria label', () => {
    page.navigateTo();
    expect(page.getCriteriaLabel()).toContain('You can receive an income from this bastille if and only if you are');
  });

  it('should display the criteria question', () => {
    page.navigateTo();
    // expect(page.getCriteria()).toContain('frequent contributor to open source projects');
  });
});

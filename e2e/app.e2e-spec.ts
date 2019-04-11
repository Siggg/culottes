import { AppPage } from './app.po';

describe('angular-truffle-box App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the criteria question', () => {
    page.navigateTo();
    expect(page.getCriteria()).toContain('Are they "');
  });
});

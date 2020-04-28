import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('angular-truffle-box App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  afterEach(function () {
    browser.manage().logs().get('browser').then(function(browserLogs) {
       // browserLogs is an array of objects with level and message fields
       browserLogs.forEach(function(log){
          if (log.level.value > -1000) { // level > 900 means it's an error log
            console.log(log.message);
          }
       });
    });
  });

  it('should display the criteria label', () => {
    page.navigateTo();
    expect(page.getCriteriaLabel()).toContain('an income from this app if and only if they are the address of');
  });

  it('should display the criteria question', () => {
    page.navigateTo();
    page.getCriteria();
    // TODO : check if we can test the value once it is read from the contract
    // expect(page.getCriteria()).toContain('frequent contributor to open source projects');
  });
  
  it('should display the hashtag', () => {
    page.navigateTo();
    page.getHashtag();
    // TODO : check if we can test the value once it is read from the contract
    // expect(page.getHashtag()).toContain('#FrequentContributorRevolution');
  }); 

});


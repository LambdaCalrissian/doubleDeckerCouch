import { browser, by, element } from 'protractor';

export class DoubleDeckerCouchPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}

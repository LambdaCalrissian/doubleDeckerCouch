import { DoubleDeckerCouchPage } from './app.po';

describe('double-decker-couch App', () => {
  let page: DoubleDeckerCouchPage;

  beforeEach(() => {
    page = new DoubleDeckerCouchPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});

require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const favorite = {
      name: 'Test Font',
      link: 'https://testfont.com',
      category: 'test-serif',
      variants: ['300', '2000'],
      subsets: ['latin', 'persian']
    };

    const databaseFavorites = {
      ...favorite,
      id: 5,
      user_id: 2
    };

    test('.post(/api/favorites) endpoint creates a favorite item and adds it to the favorites array', async() => {

      const favorite = {
        name: 'Test Font',
        link: 'https://testfont.com',
        category: 'test-serif',
        variants: ['300', '2000'],
        subsets: ['latin', 'persian']
      };

      const data = await fakeRequest(app)
        .post('/api/favorites')
        .send(favorite)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(databaseFavorites);
    });

    test('.get(/api/favorites) endpoint returns favorites array', async() => {

      const expectation = [
        {
          category: 'test-serif',
          id: 5,
          link: 'https://testfont.com',
          name: 'Test Font',
          subsets: ['latin', 'persian'],
          user_id: 2,
          variants: ['300', '2000'],
        },
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('.delete(/api/favorites/:id) endpoint deletes a favorite item and removes it from the favorites array', async() => {

      const data = await fakeRequest(app)
        .delete('/api/favorites/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([]);

    });

    test('.get(/fonts) endpoint fetches fonts from the googlefont api', async () => {
      const expectation = [
        {
          category: 'sans-serif',
          link: 'https://fonts.google.com/specimen/Barlow?preview.text_type=custom',
          name: 'Barlow',
          subsets: [
            'latin',
            'latin-ext',
            'vietnamese',
          ],
          variants: [
            '100',
            '100italic',
            '200',
            '200italic',
            '300',
            '300italic',
            'regular',
            'italic',
            '500',
            '500italic',
            '600',
            '600italic',
            '700',
            '700italic',
            '800',
            '800italic',
            '900',
            '900italic',
          ],
        },
        {
          category: 'sans-serif',
          link: 'https://fonts.google.com/specimen/Barlow+Condensed?preview.text_type=custom',
          name: 'Barlow Condensed',
          subsets: [
            'latin',
            'latin-ext',
            'vietnamese',
          ],
          variants: [
            '100',
            '100italic',
            '200',
            '200italic',
            '300',
            '300italic',
            'regular',
            'italic',
            '500',
            '500italic',
            '600',
            '600italic',
            '700',
            '700italic',
            '800',
            '800italic',
            '900',
            '900italic',
          ],
        },
        {
          category: 'sans-serif',
          link: 'https://fonts.google.com/specimen/Barlow+Semi+Condensed?preview.text_type=custom',
          name: 'Barlow Semi Condensed',
          subsets: [
            'latin',
            'latin-ext',
            'vietnamese',
          ],
          variants: [
            '100',
            '100italic',
            '200',
            '200italic',
            '300',
            '300italic',
            'regular',
            'italic',
            '500',
            '500italic',
            '600',
            '600italic',
            '700',
            '700italic',
            '800',
            '800italic',
            '900',
            '900italic',
          ],
        },
        {
          category: 'serif',
          link: 'https://fonts.google.com/specimen/Bitter?preview.text_type=custom',
          name: 'Bitter',
          subsets: [
            'cyrillic',
            'cyrillic-ext',
            'latin',
            'latin-ext',
            'vietnamese',
          ],
          variants: [
            '100',
            '200',
            '300',
            'regular',
            '500',
            '600',
            '700',
            '800',
            '900',
            '100italic',
            '200italic',
            '300italic',
            'italic',
            '500italic',
            '600italic',
            '700italic',
            '800italic',
            '900italic',
          ],
        },
      ];

      const data = await fakeRequest(app)
        .get('/fonts')
        .expect('Content-Type', /json/)
        .expect(200);

      
      const slicedData = data.body.slice(0, 4);

      expect(slicedData).toEqual(expectation);
    });

  });
});

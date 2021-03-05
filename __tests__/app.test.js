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


    test('.post(/api/favorites) endpoint creates a favorite item and adds it to the favorites array', async() => {

      const favorite = {
        name: 'Test Font',
        link: 'https://testfont.com',
        category: 'test-serif',
        variants: '{"300","2000"}',
        subsets: '{"latin","persian"}'
      };

      const databaseFavorites = {
        ...favorite,
        id: 5,
        user_id: 2
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
          subsets: '{"latin","persian"}',
          user_id: 2,
          variants: '{"300","2000"}',
        },
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('.get(api/detail/:name) endpoint returns favorites one font', async() => {

      const expectation = [
        {
          name: 'Test Font',
          category: 'test-serif',
          link: 'https://testfont.com',
          subsets: '{"latin","persian"}',
          variants: '{"300","2000"}',
          id: 5,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/detail/Test Font')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('.delete(/api/favorites/:name) endpoint deletes a favorite item and removes it from the favorites array', async() => {

      const data = await fakeRequest(app)
        .delete('/api/favorites/Test Font')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([]);

    });

    test('.get(/fonts) endpoint fetches fonts from the googlefont api', async () => {
      await fakeRequest(app)
        .get('/fonts?sort=style')
        .expect('Content-Type', /json/)
        .expect(200);
        
    });

    test('.get(/categories) endpoint returns categories array', async() => {

      const expectation = [
        {
          id: 1,
          name: 'alphabetically',
          value: 'alpha'
        },
        {
          id: 2,
          name: 'recent',
          value: 'date'
        },
        {
          id: 3,
          name: 'popularity',
          value: 'popularity'
        },
        {
          id: 4,
          name: 'style',
          value: 'style'
        },
        {
          id: 5,
          name: 'trending',
          value: 'trending'
        }
      ];

      const data = await fakeRequest(app)
        .get('/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});

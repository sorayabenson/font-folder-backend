const client = require('../lib/client');
// import our seed data:
const favorites = require('./favorites.js');
const categories = require('./categories.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      favorites.map(favorite => {
        return client.query(`
                    INSERT INTO favorites (
                      name, 
                      link, 
                      category, 
                      variants, 
                      subsets, 
                      user_id
                    )
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [
          favorite.name, 
          favorite.link, 
          favorite.category, 
          favorite.variants, 
          favorite.subsets, 
          user.id
        ]);
      })
    );

    await Promise.all(
      categories.map(category => {
        return client.query(`
                    INSERT INTO categories (
                      name, 
                      value
                    )
                    VALUES ($1, $2);
                `,
        [
          category.name, 
          category.value
        ]);
      })
    );    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}

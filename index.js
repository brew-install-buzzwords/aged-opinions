const OAuth = require('oauth');
const got = require('got');
const dateformat = require('dateformat');

async function getArticle (key) {
    let today = new Date();
    today.setFullYear( today.getFullYear() - 20 );
    const dateString = dateformat(today, 'yyyy-mm-dd');
    let apiKey = key || process.env.NYT_API_KEY;

    try {
        const response = await got(`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=section_name:("Opinion") AND source:("The New York Times") AND pub_date:("${dateString}")&api-key=${apiKey}`);
        const docs = JSON.parse(response.body).response.docs;
        const article = docs[Math.floor(Math.random() * docs.length)];
        return `${article.snippet} ${article.web_url}`;
      } catch (error) {
          console.error(error);
      }
}

async function tweet (message) {
    const twitter_application_consumer_key = process.env.API;  // API Key
    const twitter_application_secret = process.env.API_SECRET;  // API Secret
    const twitter_user_access_token = process.env.ACCESS_TOKEN;  // Access Token
    const twitter_user_secret = process.env.ACCESS_TOKEN_SECRET;  // Access Token Secret

    const oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        twitter_application_consumer_key,
        twitter_application_secret,
        '1.0A',
        null,
        'HMAC-SHA1'
    );

    const postBody = {
        'status': message
    };

    return new Promise( (resolve, reject) => {
        oauth.post('https://api.twitter.com/1.1/statuses/update.json',
            twitter_user_access_token,  // oauth_token (user access token)
            twitter_user_secret,  // oauth_secret (user secret)
            postBody,  // post body
            '',  // post content type ?
            function(err, data, res) {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                if (data) {
                    resolve(data);
                }
        });
    });
}

exports.handler = async (event) => { 
    try {
        console.log('generating content');
        const content = await getArticle();
        console.log(content);
        await tweet(content);
        
        return { statusCode: 204 };
    } catch (e) {
        console.error(e);
        return { statusCode: 500 };
    }
}

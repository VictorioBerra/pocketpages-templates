We need to fill our our test.js file.

This file needs to do the following:

- Use mocha
- Start our app with the NPM package docker-compose
- Use playwright to hit http://127.0.0.1:8090/auth/register
- Fill out email and password form using random email, submit
- Look for message on the next page "Registration successful. Please check your email to verify your account."
- Verify mailhog got the message sent to the random email, log the contents
- Adjust commands or logic if needed, if I missed anything.
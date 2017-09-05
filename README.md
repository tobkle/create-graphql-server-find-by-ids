[![npm version](https://badge.fury.io/js/create-graphql-server-find-by-ids.svg)](http://badge.fury.io/js/create-graphql-server-find-by-ids) [![Build Status](https://travis-ci.org/tobkle/create-graphql-server-find-by-ids.svg?branch=master)](https://travis-ci.org/tobkle/create-graphql-server-find-by-ids) [![Coverage Status](https://coveralls.io/repos/github/tobkle/create-graphql-server-find-by-ids/badge.svg?branch=master)](https://coveralls.io/github/tobkle/create-graphql-server-find-by-ids?branch=master)

# create-graphql-server-find-by-ids

Adds to the original findByIds an authorization enhancement for the GraphQL-Server-Generator: **create-graphql-server**

[The original tmeasday/mongo-find-by-ids you find here](https://github.com/tmeasday/mongo-find-by-ids).

## Usage
It provides just one function "findByIds", and it adds to the original version of tmeasday the authQuery and later combination of baseQuery and authQuery.
```javascript
export function findByIds(
  collection: any,
  ids: Array<any> = [],
  authQuery?: any = {}
): any {
  const baseQuery = { _id: { $in: ids } };
  const finalQuery = { ...baseQuery, ...authQuery };
  return collection
    .find(finalQuery)
    .toArray()
    .then(docs => {
      const idMap = {};
      docs.forEach(d => {
        idMap[d._id] = d;
      });
      return ids.map(id => idMap[id]);
    });
}
```


## Installation
Please add the following lines to your create-graphql-server project in server/authenticate.js. If you've forked the original create-graphql-server then don't forget to add it also to the authenticate file in the "skel" folder, otherwise your tests will fail.
```javascript
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jwt-simple';
import { ObjectId } from 'mongodb';
import nodeify from 'nodeify';
import bcrypt from 'bcrypt';
import DataLoader from 'dataloader';  // <===
import { findByIds } from 'create-graphql-server-find-by-ids'; // <===

const KEY = 'test-key';
let Loader;   // <===

async function userFromPayload(request, jwtPayload) {
  if (!jwtPayload.userId) {
    throw new Error('No userId in JWT');
  }
  return await Loader.load(ObjectId(jwtPayload.userId));  // <===
}

passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: KEY,
  passReqToCallback: true,
}, (request, jwtPayload, done) => {
  nodeify(userFromPayload(request, jwtPayload), done);
}));

export default function addPassport(app, User) {
  Loader = new DataLoader(ids => findByIds(User, ids));  // <===
  
  app.use(passport.initialize());

  app.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error('Username or password not set on request');
      }

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.hash))) {
        throw new Error('User not found matching email/password combination');
      }

      const payload = {
        userId: user._id.toString(),
      };

      const token = jwt.encode(payload, KEY);
      res.json({ token });
    } catch (e) {
      next(e);
    }
  });
}

```

## API Documentation
[Goto the API Documentatiaon](https://tobkle.github.io/create-graphql-server-find-by-ids/)

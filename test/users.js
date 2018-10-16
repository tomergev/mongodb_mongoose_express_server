const request = require('request');
const { assert, expect } = require('chai');

const url = 'http://localhost:3030';

describe('user routes', () => {
  const email = 'testemail@email.gov';
  const password = 'fnjksdHKJH6897f98h';
  let userId;
  let jwtToken;

  const urlFormEncodedData = {
    form: {
      email,
      password,
    },
  };

  it('should create user successfully and send back token in response', () => new Promise((resolve) => {
    const callback = (_err, _res, body) => {
      const res = JSON.parse(body);
      userId = res.user._id;
      expect(res).to.have.property('user').to.have.property('_id');
      expect(res).to.have.property('token');
      resolve();
    };

    request.post(`${url}/auth/signup`, urlFormEncodedData, callback);
  }));

  it('should response with user already created', () => new Promise((resolve) => {
    const callback = (_err, _res, body) => {
      const res = JSON.parse(body);
      expect(res).to.have.property('error');
      resolve();
    };

    request.post(`${url}/auth/signup`, urlFormEncodedData, callback);
  }));

  it('should return a token', () => new Promise((resolve) => {
    const callback = (_err, _res, body) => {
      const res = JSON.parse(body);
      jwtToken = `Bearer ${res.token}`;
      expect(res).to.have.property('token');
      resolve();
    };

    request.post(`${url}/auth/login`, urlFormEncodedData, callback);
  }));

  it('should return an array', () => new Promise((resolve) => {
    const options = {
      url: `${url}/users`,
      headers: {
        Authorization: jwtToken,
      },
    };

    const callback = (_err, _res, body) => {
      const res = JSON.parse(body);
      assert.typeOf(res.users, 'array');
      resolve();
    };

    request.get(options, callback);
  }));

  it('should delete user', () => new Promise((resolve) => {
    const options = {
      url: `${url}/users/${userId}`,
      headers: {
        Authorization: jwtToken,
      },
    };

    const callback = (_err, _res, body) => {
      const res = JSON.parse(body);
      assert.equal(res.message, `User ${userId} has successfully been deleted`);
      resolve();
    };

    request.delete(options, callback);
  }));
});

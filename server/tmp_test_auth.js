const http = require('http');

const post = (path, body) => new Promise((resolve, reject) => {
  const data = JSON.stringify(body);
  const opts = {
    host: '127.0.0.1',
    port: 5000,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = http.request(opts, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        resolve({ status: res.statusCode, body: d ? JSON.parse(d) : null });
      } catch (e) {
        resolve({ status: res.statusCode, body: d });
      }
    });
  });
  req.on('error', reject);
  req.write(data);
  req.end();
});

(async () => {
  const t = Date.now();
  const user = {
    username: `autotest_${t}`,
    email: `autotest_${t}@example.com`,
    password: 'Password123'
  };
  try {
    console.log('Registering user:', user.username);
    const reg = await post('/api/auth/register', user);
    console.log('Register response:', reg);

    if (reg.status === 200 && reg.body && reg.body.token) {
      console.log('Registration succeeded, now attempting login...');
    } else {
      console.log('Registration did not return token, response body:', reg.body);
    }

    const login = await post('/api/auth/login', { email: user.email, password: user.password });
    console.log('Login response:', login);
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
  }
})();

const fs = require('fs');

const createMockJwt = (payload) => {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '');
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  return `${header}.${body}.mocksignature`;
};

const token = createMockJwt({
    id: 1,
    email: "test@test.com",
    role: "OWNER",
    name: "Dueño",
    tenantId: 1
});

console.log("Mock token generated:", token);

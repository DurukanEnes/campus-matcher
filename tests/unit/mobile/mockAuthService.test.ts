import { AuthError, createMockAuthService } from "../../../mobile/src/auth/mockAuthService";

function sequentialCodes() {
  let next = 100000;
  return () => String(next++);
}

async function expectAuthError(promise: Promise<unknown>, code: AuthError["code"]) {
  await expect(promise).rejects.toMatchObject({ name: "AuthError", code });
}

const zeynep = { displayName: "Zeynep", email: "zeynep@itu.edu.tr", password: "campus123" };

test("registration with a non-İTÜ address is rejected", async () => {
  const service = createMockAuthService();
  await expectAuthError(service.register({ ...zeynep, email: "zeynep@gmail.com" }), "INVALID_EMAIL_DOMAIN");
});

test("an account cannot log in before it is verified", async () => {
  const service = createMockAuthService();
  await service.register(zeynep);
  await expectAuthError(service.login(zeynep.email, zeynep.password), "EMAIL_NOT_VERIFIED");
});

test("the correct code activates the account and returns a session", async () => {
  const service = createMockAuthService({ generateCode: sequentialCodes() });
  await service.register(zeynep);

  const session = await service.verifyEmail(zeynep.email, "100000");

  expect(session.accessToken).toEqual(expect.any(String));
  expect(session.user).toMatchObject({ email: "zeynep@itu.edu.tr", displayName: "Zeynep", role: "USER" });
  await expect(service.login(zeynep.email, zeynep.password)).resolves.toMatchObject({
    user: { email: "zeynep@itu.edu.tr" },
  });
});

test("registration with a weak password is rejected", async () => {
  const service = createMockAuthService();
  await expectAuthError(service.register({ ...zeynep, password: "abcdefgh" }), "WEAK_PASSWORD");
});

test("a code older than 10 minutes is rejected", async () => {
  let now = 0;
  const service = createMockAuthService({ generateCode: sequentialCodes(), now: () => now });
  await service.register(zeynep);

  now = 11 * 60 * 1000;
  await expectAuthError(service.verifyEmail(zeynep.email, "100000"), "CODE_EXPIRED");
});

test("a code is still valid just before 10 minutes", async () => {
  let now = 0;
  const service = createMockAuthService({ generateCode: sequentialCodes(), now: () => now });
  await service.register(zeynep);

  now = 10 * 60 * 1000 - 1;
  await expect(service.verifyEmail(zeynep.email, "100000")).resolves.toBeDefined();
});

test("after 5 wrong attempts even the correct code is rejected until a new code is sent", async () => {
  const service = createMockAuthService({ generateCode: sequentialCodes() });
  await service.register(zeynep);
  for (let attempt = 0; attempt < 5; attempt++) {
    await expectAuthError(service.verifyEmail(zeynep.email, "999999"), "INVALID_CODE");
  }

  await expectAuthError(service.verifyEmail(zeynep.email, "100000"), "TOO_MANY_ATTEMPTS");

  await service.resendCode(zeynep.email);
  await expect(service.verifyEmail(zeynep.email, "100001")).resolves.toBeDefined();
});

test("a wrong code is rejected", async () => {
  const service = createMockAuthService({ generateCode: sequentialCodes() });
  await service.register(zeynep);
  await expectAuthError(service.verifyEmail(zeynep.email, "999999"), "INVALID_CODE");
});

test("a newly requested code replaces the old one", async () => {
  const service = createMockAuthService({ generateCode: sequentialCodes() });
  await service.register(zeynep);
  await service.resendCode(zeynep.email);

  await expectAuthError(service.verifyEmail(zeynep.email, "100000"), "INVALID_CODE");
  await expect(service.verifyEmail(zeynep.email, "100001")).resolves.toBeDefined();
});

test("an e-mail cannot be registered twice", async () => {
  const service = createMockAuthService();
  await service.register(zeynep);
  await expectAuthError(service.register({ ...zeynep, email: "ZEYNEP@itu.edu.tr" }), "EMAIL_TAKEN");
});

test("the seeded demo member can log in and a wrong password is rejected", async () => {
  const service = createMockAuthService();
  await expect(service.login("demo@itu.edu.tr", "campus123")).resolves.toMatchObject({
    user: { email: "demo@itu.edu.tr" },
  });
  await expectAuthError(service.login("demo@itu.edu.tr", "wrong-password"), "INVALID_CREDENTIALS");
  await expectAuthError(service.login("nobody@itu.edu.tr", "campus123"), "INVALID_CREDENTIALS");
});

import {
  isItuEmail,
  validateLogin,
  validateRegistration,
  validateVerificationCode,
} from "../../../mobile/src/auth/validation";

describe("isItuEmail", () => {
  test("accepts student and staff addresses in the itu.edu.tr domain", () => {
    expect(isItuEmail("zeynep@itu.edu.tr")).toBe(true);
    expect(isItuEmail("  Ayse.Tosun@ITU.EDU.TR ")).toBe(true);
  });

  test("rejects other domains and look-alike domains", () => {
    expect(isItuEmail("zeynep@gmail.com")).toBe(false);
    expect(isItuEmail("zeynep@itu.edu.tr.com")).toBe(false);
    expect(isItuEmail("zeynep@notitu.edu.tr")).toBe(false);
    expect(isItuEmail("@itu.edu.tr")).toBe(false);
    expect(isItuEmail("zey nep@itu.edu.tr")).toBe(false);
  });
});

describe("validateRegistration", () => {
  const valid = { displayName: "Zeynep", email: "zeynep@itu.edu.tr", password: "campus123" };

  test("returns no errors for a valid registration", () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  test("requires a display name", () => {
    expect(validateRegistration({ ...valid, displayName: "   " }).displayName).toBe("Enter your name.");
  });

  test("explains that only @itu.edu.tr addresses can register", () => {
    expect(validateRegistration({ ...valid, email: "zeynep@gmail.com" }).email).toBe(
      "Only @itu.edu.tr addresses can register.",
    );
  });

  test.each(["abc12", "abcdefgh", "12345678"])("rejects the weak password %p and explains the rule", (password) => {
    expect(validateRegistration({ ...valid, password }).password).toBe(
      "Use at least 8 characters with a letter and a digit.",
    );
  });

  test("accepts a password with 8 characters, a letter, and a digit", () => {
    expect(validateRegistration({ ...valid, password: "abcdefg1" }).password).toBeUndefined();
  });
});

describe("validateLogin", () => {
  test("requires an İTÜ e-mail and a password", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Enter your @itu.edu.tr address.",
      password: "Enter your password.",
    });
  });

  test("returns no errors for filled fields", () => {
    expect(validateLogin({ email: "zeynep@itu.edu.tr", password: "anything" })).toEqual({});
  });
});

describe("validateVerificationCode", () => {
  test("accepts exactly six digits", () => {
    expect(validateVerificationCode("123456")).toBeUndefined();
    expect(validateVerificationCode(" 123456 ")).toBeUndefined();
  });

  test("rejects codes that are not six digits", () => {
    expect(validateVerificationCode("12345")).toBe("Enter the 6-digit code.");
    expect(validateVerificationCode("12345a")).toBe("Enter the 6-digit code.");
  });
});

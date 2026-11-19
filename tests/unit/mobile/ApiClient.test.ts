
import { apiClient } from "../../../mobile/src/api/client";

describe("API Client Configuration", () => {
    test("uses the configured API base URL", () => {
        expect(apiClient.defaults.baseURL).toBe(
            process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000"
        );
    });

    test("sets request timeout to 10 seconds", () => {
        expect(apiClient.defaults.timeout).toBe(10000);
    });
});

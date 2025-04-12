import axios from "axios";
import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ScanVfProvider", () => {
    const provider = new ScanVfProvider();

    it("should search for manga", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                suggestions: [
                    {value: "One Piece", data: "one_piece"},
                    {value: "One Punch Man", data: "one-punch-man"}
                ]
            }
        });

        const mangas = await provider.search("one");

        expect(mangas).toHaveLength(2);
        expect(mangas[0].title).toBe("One Piece");
        expect(mangas[0].url).toContain("https://www.scan-vf.net")
    });

    it("should throw ScanVfSearchException on failure", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

        await expect(provider.search("fail")).rejects.toThrow(ScanVfSearchException);
    });
});
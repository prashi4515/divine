import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScripturesService } from "./scriptures.service";

describe("ScripturesService.remove", () => {
  const findUnique = vi.fn();
  const deleteMany = vi.fn();
  const scriptureDelete = vi.fn();
  const workDelete = vi.fn();
  const transaction = vi.fn();

  let service: ScripturesService;

  beforeEach(() => {
    findUnique.mockReset();
    deleteMany.mockReset();
    scriptureDelete.mockReset();
    workDelete.mockReset();
    transaction.mockReset();

    transaction.mockImplementation(
      async (fn: (tx: {
        mediaAsset: { deleteMany: typeof deleteMany };
        scripture: { delete: typeof scriptureDelete };
        work: { delete: typeof workDelete };
      }) => Promise<void>) =>
        fn({
          mediaAsset: { deleteMany },
          scripture: { delete: scriptureDelete },
          work: { delete: workDelete },
        }),
    );

    service = new ScripturesService({
      scripture: { findUnique },
      $transaction: transaction,
    } as never);
  });

  it("deletes scripture, media, and linked work so public catalog cannot keep serving it", async () => {
    findUnique.mockResolvedValue({
      id: "scripture-1",
      workId: "work-1",
    });

    await service.remove("scripture-1");

    expect(deleteMany).toHaveBeenCalledWith({ where: { scriptureId: "scripture-1" } });
    expect(scriptureDelete).toHaveBeenCalledWith({ where: { id: "scripture-1" } });
    expect(workDelete).toHaveBeenCalledWith({ where: { id: "work-1" } });
  });

  it("deletes scripture without work when unlinked", async () => {
    findUnique.mockResolvedValue({ id: "scripture-2", workId: null });

    await service.remove("scripture-2");

    expect(scriptureDelete).toHaveBeenCalledWith({ where: { id: "scripture-2" } });
    expect(workDelete).not.toHaveBeenCalled();
  });

  it("throws NotFound when scripture is missing", async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.remove("missing")).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction).not.toHaveBeenCalled();
  });
});

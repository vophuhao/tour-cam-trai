import AppError from "@/errors/app-error";
import assert from "node:assert";

type AppAssert = <T>(condition: T, error: AppError) => asserts condition;

const appAssert: AppAssert = (condition, error) => {
  assert(condition, error);
};

export default appAssert;

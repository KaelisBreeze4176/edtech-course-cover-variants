import assert from "node:assert/strict";
import {deadlineState} from "../src/edtech_service.ts";
const due=new Date("2030-01-02T00:00:00Z");
assert.equal(deadlineState(due,new Date("2030-01-01T00:00:00Z")),"open");
assert.equal(deadlineState(due,new Date("2030-01-02T00:00:00Z")),"due");
assert.equal(deadlineState(due,new Date("2030-01-03T00:00:00Z")),"late");
console.log("deadline decisions pass");
